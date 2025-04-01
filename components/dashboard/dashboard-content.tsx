"use client";

import {
  CheckCircle,
  ListTodo,
  Clock,
  AlertCircle,
  Calendar,
  CheckSquare,
  BarChart3,
  PieChart,
  PauseCircle,
  UserPlus,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { TaskList } from "@/components/dashboard/task-list";
import { Task, User } from "@/db/schema";
import TaskButtonWrapper from "./TaskButtonWrapper";
import { AnimatedCard } from "./animate-card";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import {
  getAllTasks,
  getTasksAssignedByMe,
  getTasksAssignedToMe,
} from "@/lib/services/task-service";
import { NotificationBell } from "@/components/notification-bell";
import { useSocket } from "@/components/providers/socket-provider";
import React from "react";

type DashboardContentProps = {
  users: User[];
  onSubmit: (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => Promise<void>;
};

type ResponseData = {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
  stats: {
    totalTasksCount: number;
    totalCompletedTasksCount: number;
    pending: number;
    overdue: number;
  };
};

type TaskStats = {
  totalTasksCount: number;
  totalCompletedTasksCount: number;
  pending: number;
  overdue: number;
  dateExtensionRequests: number;
  onHoldTasks: number;
};

const topLevelTabArr = ["Assign By Me", "Assign To Me", "Assign By Everyone"];

export function DashboardContent({ users, onSubmit }: DashboardContentProps) {
  const { user } = useAuth();
  const { socket, refreshTasks } = useSocket();
  const [topLevelTab, setTopLevelTab] = useState<string>("Assign By Me");
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const [activeTab, setActiveTab] = useState<
    | "all"
    | "pending"
    | "completed"
    | "overdue"
    | "date_extension"
    | "on_hold"
    | "assigned_by_me"
    | "assigned_to_me"
  >("all");
  const [stats, setStats] = useState<TaskStats>({
    totalTasksCount: 0,
    totalCompletedTasksCount: 0,
    pending: 0,
    overdue: 0,
    dateExtensionRequests: 0,
    onHoldTasks: 0,
  });

  // Use a ref to track the latest fetch request
  const fetchTimestampRef = React.useRef(Date.now());

  const fetchTasks = useCallback(
    async (page: number = 1, size: number = pageSize) => {
      if (!user?.id && topLevelTab !== "Assign By Everyone") return;

      setIsLoading(true);

      // Store the current request timestamp to handle race conditions
      const requestTimestamp = Date.now();

      try {
        let response: ResponseData | undefined;

        // Add the active tab as a filter parameter in API calls
        if (topLevelTab === topLevelTabArr[0] && user?.id) {
          response = await getTasksAssignedByMe(user.id, page, size, activeTab);
        } else if (topLevelTab === topLevelTabArr[1] && user?.id) {
          response = await getTasksAssignedToMe(user.id, page, size, activeTab);
        } else if (topLevelTab === topLevelTabArr[2] && user?.isAdmin) {
          response = await getAllTasks(page, size, activeTab);
        }

        console.log(
          "in fetchTasks(), response:",
          response,
          ", page:",
          page,
          ", page size:",
          size,
          ", filter:",
          activeTab
        );

        if (!response) {
          throw new Error("No response from server");
        }

        // Only update state if this is the most recent request
        if (requestTimestamp === fetchTimestampRef.current) {
          setTasks(response.tasks);
          setTotalPages(response.totalPages);

          // Calculate additional stats from the tasks
          const dateExtensionRequests = response.tasks.filter(
            (task) => !!task.requestedDate && !!task.requestDateExtensionReason
          ).length;

          const onHoldTasks = response.tasks.filter(
            (task) => !task.completed && task.status === "on_hold"
          ).length;

          // Manually calculate local stats for date-related stats to handle null dueDate
          const today = new Date().toISOString().split("T")[0];
          const pending = response.tasks.filter(
            (task) => !task.completed && task.dueDate && task.dueDate >= today
          ).length;

          const overdue = response.tasks.filter(
            (task) => !task.completed && task.dueDate && task.dueDate < today
          ).length;

          // Use API stats for counts but local calculations for date-dependent stats
          setStats({
            totalTasksCount: response.stats.totalTasksCount,
            totalCompletedTasksCount: response.stats.totalCompletedTasksCount,
            pending: response.stats.pending,
            overdue: response.stats.overdue,
            dateExtensionRequests,
            onHoldTasks,
          });
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks");
        setTasks([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, topLevelTab, activeTab, pageSize]
  );

  // Update the timestamp ref when we call fetchTasks
  const fetchTasksWithTimestamp = useCallback(
    (page: number = 1, size: number = pageSize) => {
      fetchTimestampRef.current = Date.now();
      fetchTasks(page, size);
    },
    [fetchTasks, pageSize]
  );

  // Fetch tasks when topLevelTab or activeTab changes
  useEffect(() => {
    fetchTasksWithTimestamp(1);
    setCurrentPage(1);
  }, [topLevelTab, activeTab, fetchTasksWithTimestamp]);

  // Listen for socket events to refresh data automatically
  useEffect(() => {
    if (!socket) return;

    const handleRefresh = (data: any) => {
      console.log("Refreshing tasks due to socket event:", data);
      fetchTasksWithTimestamp(currentPage, pageSize);
      refreshTasks();
    };

    const handleTaskComplete = (data: any) => {
      console.log("Task completion event received:", data);
      // First update the local state optimistically
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === data.taskId ? { ...task, completed: true } : task
        )
      );
      // Then fetch fresh data from the server
      fetchTasksWithTimestamp(currentPage, pageSize);
      refreshTasks();
    };

    const handleTaskReopen = (data: any) => {
      console.log("Task reopened event received:", data);
      // First update the local state optimistically
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === data.taskId ? { ...task, completed: false } : task
        )
      );
      // Then fetch fresh data from the server
      fetchTasksWithTimestamp(currentPage, pageSize);
      refreshTasks();
    };

    const handleTaskDelete = (data: { taskId: number }) => {
      console.log("Task deleted event received for task", data.taskId);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== data.taskId)
      );
      refreshTasks();
    };

    // Use the socket.on method directly
    socket.on("task_created", handleRefresh);
    socket.on("task_updated", handleRefresh);
    socket.on("task_completed", handleTaskComplete);
    socket.on("task_reopened", handleTaskReopen);
    socket.on("task_deleted", handleTaskDelete);

    // Also listen for generic broadcast events
    socket.on("notification", (notification) => {
      console.log(
        "Received notification that should trigger refresh:",
        notification
      );

      // Handle different notification types specifically
      if (notification.type === "task_completed") {
        handleTaskComplete(notification);
      } else if (notification.type === "task_reopened") {
        handleTaskReopen(notification);
      } else {
        handleRefresh(notification);
      }
    });

    return () => {
      socket.off("task_created", handleRefresh);
      socket.off("task_updated", handleRefresh);
      socket.off("task_completed", handleTaskComplete);
      socket.off("task_reopened", handleTaskReopen);
      socket.off("task_deleted", handleTaskDelete);
      socket.off("notification");
    };
  }, [socket, fetchTasksWithTimestamp, currentPage, pageSize, refreshTasks]);

  // Add a helper function to directly refresh data
  const refreshData = useCallback(() => {
    console.log("Manual refresh triggered");
    fetchTasksWithTimestamp(currentPage, pageSize);
  }, [fetchTasksWithTimestamp, currentPage, pageSize]);

  const handleSubmit = async (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => {
    try {
      const toastId = toast.loading(
        type === "add" ? "Creating task..." : "Updating task..."
      );

      await onSubmit(type, task, files);

      if (type === "add") {
        // Refresh tasks immediately rather than waiting for socket notification
        fetchTasksWithTimestamp(currentPage, pageSize);
        // Also still refresh the router for navigation
        router.refresh();
      } else {
        // For updates, optimistically update the UI
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, ...task } : t))
        );
        // Also fetch from server to ensure we have latest data
        fetchTasksWithTimestamp(currentPage, pageSize);
      }

      toast.success(
        type === "add"
          ? "Task created successfully"
          : "Task updated successfully",
        {
          id: toastId,
        }
      );
    } catch (error) {
      console.error(`Failed to ${type} task:`, error);
      toast.error(`Failed to ${type} task. Please try again.`);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      // Optimistically update UI
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      toast.success("Task deleted successfully");

      // Refresh tasks to ensure we have latest data
      fetchTasksWithTimestamp(currentPage, pageSize);
      router.refresh();
    } catch (error) {
      // Rollback on error
      setTasks((prevTasks) => [
        ...prevTasks,
        tasks.find((t) => t.id === taskId)!,
      ]);
      toast.error("Failed to delete task");
    }
  };

  const handlePageChange = (page: number) => {
    console.log(
      "DashboardContent: handlePageChange called with page:",
      page,
      "pageSize:",
      pageSize
    );
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Be explicit about using fetchTasksWithTimestamp to ensure we're setting the timestamp properly
      fetchTasksWithTimestamp(page, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    console.log("Changing page size from", pageSize, "to", newSize);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchTasks(1, newSize);
  };

  // Calculate completion rate percentage
  const completionRate =
    stats.totalTasksCount > 0
      ? Math.round(
          (stats.totalCompletedTasksCount / stats.totalTasksCount) * 100
        )
      : 0;

  // Add polling as a fallback for auto-refresh
  useEffect(() => {
    // Poll for updates every 30 seconds as a fallback
    const intervalId = setInterval(() => {
      console.log("Polling for updates");
      fetchTasksWithTimestamp(currentPage, pageSize);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchTasksWithTimestamp, currentPage, pageSize]);

  // Filter tabs based on admin status
  const visibleTabs = topLevelTabArr.filter((tab) => {
    if (tab === "Assign By Everyone") {
      return user?.isAdmin;
    }
    return true;
  });

  return (
    <main className="container flex flex-1 flex-col gap-8 p-4 md:gap-10 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <DashboardHeader
          heading="Task Dashboard"
          text="Manage your tasks, monitor progress, and track deadlines."
        >
          <div className="flex items-center gap-4">
            <NotificationBell />
            <TaskButtonWrapper onSubmit={handleSubmit} />
          </div>
        </DashboardHeader>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <ul className="flex border-b pb-5">
          {visibleTabs.map((tab) => (
            <li
              key={tab}
              onClick={() => setTopLevelTab(tab)}
              className={`p-2 cursor-pointer border rounded-md ${
                topLevelTab === tab
                  ? "border-slate-300 bg-green-200"
                  : "border-transparent"
              }
              hover:border-slate-300
              `}
            >
              {tab}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Loading Indicator */}
      {isLoading && tasks.length === 0 && (
        <div className="w-full flex justify-center items-center p-8">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mb-2"></div>
            <p className="text-slate-600">Loading tasks...</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div
        className={`grid gap-5 md:grid-cols-2 lg:grid-cols-5 w-full ${
          isLoading && tasks.length === 0 ? "opacity-50" : ""
        }`}
      >
        <AnimatedCard>
          <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4">
              <CardTitle className="text-base font-medium text-slate-800">
                Total Tasks
              </CardTitle>
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-slate-900">
                {stats.totalTasksCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Tasks in the system</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4">
              <CardTitle className="text-base font-medium text-slate-800">
                Completed
              </CardTitle>
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckSquare className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-900">
                  {stats.totalCompletedTasksCount}
                </div>
                <div className="text-sm font-medium text-emerald-600">
                  {completionRate}%
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Tasks completed</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4">
              <CardTitle className="text-base font-medium text-slate-800">
                Pending
              </CardTitle>
              <div className="bg-amber-100 p-2 rounded-full">
                <ListTodo className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-slate-900">
                {stats.pending}
              </div>
              <p className="text-xs text-slate-500 mt-1">Tasks in progress</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4">
              <CardTitle className="text-base font-medium text-slate-800">
                Overdue
              </CardTitle>
              <div className="bg-red-100 p-2 rounded-full">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-slate-900">
                {stats.overdue}
              </div>
              <p className="text-xs text-slate-500 mt-1">Tasks past deadline</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4">
              <CardTitle className="text-base font-medium text-slate-800">
                On Hold
              </CardTitle>
              <div className="bg-slate-100 p-2 rounded-full">
                <PauseCircle className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-slate-900">
                {stats.onHoldTasks}
              </div>
              <p className="text-xs text-slate-500 mt-1">Tasks on hold</p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Extensions Card */}
      {stats.dateExtensionRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full"
        >
          <Card className="border-amber-200 bg-amber-50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base font-medium text-amber-800">
                  Extension Requests
                </CardTitle>
              </div>
              <div className="bg-white border border-amber-200 px-2.5 py-1 rounded-full">
                <span className="text-amber-700 font-bold">
                  {stats.dateExtensionRequests}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 text-sm">
                You have {stats.dateExtensionRequests} pending deadline
                extension{" "}
                {stats.dateExtensionRequests === 1 ? "request" : "requests"}{" "}
                that need your review.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-md w-full overflow-hidden"
      >
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-6 w-full h-auto max-w-full mx-auto mb-8 bg-slate-100 p-1.5 rounded-lg">
            <TabsTrigger
              value="all"
              className="rounded-md py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              All Tasks
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-md py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-md py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="overdue"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm h-auto py-2.5 text-sm font-medium"
            >
              Overdue
            </TabsTrigger>
            <TabsTrigger
              value="on_hold"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm h-auto py-2.5 text-sm font-medium"
            >
              On Hold
            </TabsTrigger>
            <TabsTrigger
              value="date_extension"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm h-auto py-2.5 text-sm font-medium"
            >
              Extensions
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="pb-2">
            <TabsContent value="all" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="all"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                isLoading={isLoading}
                totalTaskCount={stats.totalTasksCount}
              />
            </TabsContent>
            <TabsContent value="pending" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="pending"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                isLoading={isLoading}
                totalTaskCount={stats.totalTasksCount}
              />
            </TabsContent>
            <TabsContent value="completed" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="completed"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                isLoading={isLoading}
                totalTaskCount={stats.totalTasksCount}
              />
            </TabsContent>
            <TabsContent value="overdue" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="overdue"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                isLoading={isLoading}
                totalTaskCount={stats.totalTasksCount}
              />
            </TabsContent>
            <TabsContent value="on_hold" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="on_hold"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                isLoading={isLoading}
                totalTaskCount={stats.totalTasksCount}
              />
            </TabsContent>
            <TabsContent value="date_extension" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="date_extension"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                isLoading={isLoading}
                totalTaskCount={stats.totalTasksCount}
              />
            </TabsContent>
            <TabsContent value="assigned_by_me" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="assigned_by_me"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                isLoading={isLoading}
                totalTaskCount={stats.totalTasksCount}
              />
            </TabsContent>
            <TabsContent value="assigned_to_me" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="assigned_to_me"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                isLoading={isLoading}
                totalTaskCount={stats.totalTasksCount}
              />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </main>
  );
}
