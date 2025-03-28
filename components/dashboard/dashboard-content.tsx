"use client";

import { CheckCircle, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { TaskList } from "@/components/dashboard/task-list";
import { Task, User } from "@/db/schema";
import TaskButtonWrapper from "./TaskButtonWrapper";
import { AnimatedCard } from "./animate-card";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type DashboardContentProps = {
  initialTasks: Task[];
  users: User[];
  onSubmit: (type: "add" | "edit", task: Task) => Promise<void>;
};

type TaskStats = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
};

export function DashboardContent({
  users,
  initialTasks,
  onSubmit,
}: DashboardContentProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "completed" | "overdue" | "date_extension"
  >("all");
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });

  // Update tasks when initialTasks changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Calculate stats from tasks instead of fetching from API
  useEffect(() => {
    const calculateStats = () => {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task) => task.completed).length;
      const pendingTasks = tasks.filter((task) => !task.completed).length;
      const overdueTasks = tasks.filter(
        (task) =>
          !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
      ).length;

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      });
    };

    calculateStats();
  }, [tasks]);

  const handleSubmit = async (type: "add" | "edit", task: Task) => {
    try {
      // Optimistic update
      if (type === "add") {
        setTasks((prev) => [...prev, task]);
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, ...task } : t))
        );
      }

      // API call
      await onSubmit(type, task);
      toast.success(
        `Task ${type === "add" ? "created" : "updated"} successfully`
      );

      // Refresh the page data
      router.refresh();
    } catch (error) {
      // Rollback on error
      if (type === "add") {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? initialTasks.find((init) => init.id === t.id) || t
              : t
          )
        );
      }
      toast.error(`Failed to ${type} task`);
      console.error("Failed to submit task:", error);
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

  return (
    <main className="container flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <DashboardHeader
        heading="Dashboard"
        text="Manage your tasks and monitor progress."
      >
        <TaskButtonWrapper onSubmit={handleSubmit} />
      </DashboardHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
            </CardContent>
          </Card>
        </AnimatedCard>
        <AnimatedCard delay={0.1}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
            </CardContent>
          </Card>
        </AnimatedCard>
        <AnimatedCard delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            </CardContent>
          </Card>
        </AnimatedCard>
        <AnimatedCard delay={0.3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdueTasks}</div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="all"
        className="mt-6"
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="date_extension">Date Extension</TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="all" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter={undefined}
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter="pending"
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter="completed"
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter="overdue"
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
        <TabsContent value="date_extension" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter="date_extension"
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
