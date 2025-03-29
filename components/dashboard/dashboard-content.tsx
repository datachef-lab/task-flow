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

type DashboardContentProps = {
  initialTasks: Task[];
  users: User[];
  onSubmit: (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => Promise<void>;
};

type TaskStats = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  dateExtensionRequests: number;
  onHoldTasks: number;
};

export function DashboardContent({
  users,
  initialTasks,
  onSubmit,
}: DashboardContentProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "completed" | "overdue" | "date_extension" | "on_hold"
  >("all");
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    dateExtensionRequests: 0,
    onHoldTasks: 0,
  });

  // Update tasks when initialTasks changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Calculate stats from tasks
  useEffect(() => {
    const calculateStats = () => {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task) => task.completed).length;
      const pendingTasks = tasks.filter((task) => !task.completed).length;
      const overdueTasks = tasks.filter(
        (task) =>
          !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
      ).length;
      const dateExtensionRequests = tasks.filter(
        (task) => !!task.requestedDate && !!task.requestDateExtensionReason
      ).length;
      const onHoldTasks = tasks.filter(
        (task) => !task.completed && task.status === "on_hold"
      ).length;

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        dateExtensionRequests,
        onHoldTasks,
      });
    };

    calculateStats();
  }, [tasks]);

  const handleSubmit = async (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => {
    try {
      // Show loading toast
      const toastId = toast.loading(
        type === "add" ? "Creating task..." : "Updating task..."
      );

      // Call the API
      await onSubmit(type, task, files);

      // Update local state
      if (type === "add") {
        // For now, we'll rely on router refresh instead of local state update
        // since we don't have the ID of the new task
        router.refresh();
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, ...task } : t))
        );
      }

      // Show success toast
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
      // Optimistically update the UI
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      toast.success("Task deleted successfully");
      // Refresh the page data
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

  // Calculate completion rate percentage
  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

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
        <TaskButtonWrapper onSubmit={handleSubmit} />
      </DashboardHeader>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5 w-full">
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
                {stats.totalTasks}
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
                  {stats.completedTasks}
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
                {stats.pendingTasks}
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
                {stats.overdueTasks}
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
              value="extensions"
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
                filter={undefined}
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
              />
            </TabsContent>
            <TabsContent value="pending" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="pending"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
              />
            </TabsContent>
            <TabsContent value="completed" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="completed"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
              />
            </TabsContent>
            <TabsContent value="overdue" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="overdue"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
              />
            </TabsContent>
            <TabsContent value="date_extension" className="m-0 pt-2 w-full">
              <TaskList
                users={users}
                allTasks={tasks}
                filter="date_extension"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
              />
            </TabsContent>
            <TabsContent value="on_hold" className="m-0 pt-2 w-full">
            <TaskList
              users={users}
                allTasks={tasks}
                filter="on_hold"
                onSubmit={handleSubmit}
                onTaskDelete={handleTaskDelete}
            />
          </TabsContent>
          </div>
      </Tabs>
      </motion.div>
    </main>
  );
}
