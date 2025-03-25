"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";
import { Task, User } from "@/db/schema";
import TaskCard from "./task-card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DeleteTaskAlert } from "./delete-task-alert";

interface TaskListProps {
  allTasks: Task[];
  filter?: "all" | "pending" | "completed" | "overdue";
  users: User[];
  onSubmit: (type: "add" | "edit", task: Task) => Promise<void>;
  onTaskDelete: (taskId: number) => Promise<void>;
}

export function TaskList({
  filter,
  users,
  allTasks,
  onSubmit,
  onTaskDelete,
}: TaskListProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [currentDate, setCurrentDate] = useState(null);

  useEffect(() => {
    setTasks(allTasks);
    setCurrentDate(new Date());
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

      // API call
      const updatedTask = { ...task, completed: !task.completed };
      await onSubmit("edit", updatedTask);

      // Optimistic update
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      toast.success("Task updated successfully");
      router.refresh();
    } catch (error) {
      // Rollback optimistic update
      //   setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
      toast.error("Failed to update task");
    }
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleDeleteConfirm = async (task: Task) => {
    try {
      // Optimistic update
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));

      // API call
      await onTaskDelete(task.id);
      toast.success("Task deleted successfully");
      setTaskToDelete(null);
      router.refresh();
    } catch (error) {
      // Rollback on error
      setTasks((prevTasks) => [...prevTasks, task]);
      toast.error("Failed to delete task");
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
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
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Sr. No.</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>By</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.length === 0 ? (
            <TableRow>
              <div className="text-center">
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-sm text-muted-foreground">
                  {filter
                    ? `There are no ${filter} tasks at the moment.`
                    : "Create a new task to get started."}
                </p>
              </div>
            </TableRow>
          ) : (
            filteredTasks.map((task, index) => (
              <TaskCard
                index={index}
                key={task.id}
                task={task}
                onSubmit={onSubmit}
                onDeleteClick={() => handleDeleteConfirm(task)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
