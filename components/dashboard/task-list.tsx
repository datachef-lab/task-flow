"use client";

import { useEffect, useState } from "react";
import { Task, User } from "@/db/schema";
import TaskCard from "./task-card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TaskListProps {
  allTasks: Task[];
  filter?: "pending" | "completed" | "overdue";
  users: User[];
  onSubmit: (type: "add" | "edit", task: Task) => Promise<void>;
}

export function TaskList({ filter, users, allTasks, onSubmit }: TaskListProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTasks(allTasks);
  }, [allTasks]);

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const isConfirmed = confirm(
        `Do you want to ${!task.completed ? "complete" : "reopen"} ${
          task.abbreviation
        }?`
      );

      if (!isConfirmed) return;

      // Optimistic update
      const updatedTask = { ...task, completed: !task.completed };
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

      // API call
      await onSubmit("edit", updatedTask);
      toast.success("Task updated successfully");
    } catch (error) {
      // Rollback optimistic update
    //   setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const isConfirmed = confirm(
        `Are you sure you want to delete task ${task.abbreviation}?`
      );

      if (!isConfirmed) return;

      // Optimistic update
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      // API call
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      toast.success("Task deleted successfully");
    } catch (error) {
      // Rollback optimistic update
      setTasks(allTasks);
      toast.error("Failed to delete task");
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    type: "add" | "edit",
    task: Task
  ) => {
    e.preventDefault();
    try {
      const url = type === "add" ? "/api/tasks" : `/api/tasks/${task.id}`;
      const method = type === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (!res.ok) throw new Error(`Failed to ${type} task`);

      router.refresh();
      toast.success(
        `Task ${type === "add" ? "created" : "updated"} successfully`
      );
    } catch (error) {
      toast.error(
        `Operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    if (filter === "overdue")
      return (
        !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
      );
    return true;
  });

  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              {filter
                ? `There are no ${filter} tasks at the moment.`
                : "Create a new task to get started."}
            </p>
          </div>
        </div>
      ) : (
        filteredTasks.map((task, index) => (
          <TaskCard
            index={index}
            key={task.id}
            task={task}
            onSubmit={onSubmit}
          />
        ))
      )}
    </div>
  );
}
