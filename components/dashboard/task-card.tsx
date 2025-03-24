"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import TaskButton from "./task-button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle, Clock, MoreHorizontal, Trash } from "lucide-react";
import { Task, User } from "@/db/schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteTaskAlert } from "./delete-task-alert";

type TaskCardProps = {
  task: Task;
  index: number;
  onSubmit: (type: "add" | "edit", task: Task) => Promise<void>;
  onDeleteClick: () => void;
};

export default function TaskCard({
  task,
  index,
  onSubmit,
  onDeleteClick,
}: TaskCardProps) {
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignedUser = async () => {
      const response = await fetch(`/api/users/${task.assignedUserId}`);
      const data = await response.json();
      console.log("users:", data);
      setAssignedUser(data);
    };

    fetchAssignedUser();
  }, []);

  const toggleTaskCompletion = async () => {
    try {
      const isConfirmed = confirm(
        `Do you want to ${!task.completed ? "complete" : "reopen"} ${
          task.abbreviation
        }?`
      );

      if (!isConfirmed) return;

      const updatedTask = { ...task, completed: !task.completed };
      const res = await fetch(`/api/tasks/${task.id}/toggle`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Failed to update task");

      // Update parent state
      await onSubmit("edit", updatedTask);
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      router.refresh(); // Refresh the page to update stats
    }
  };

  const handleDeleteTask = async () => {
    await onDeleteClick();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={`${task.completed ? "bg-muted/50" : ""} transition-colors`}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={toggleTaskCompletion}
                className="mt-1"
              />
              <div>
                <h3
                  className={`font-medium ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.description}
                </h3>
                <p className="text-muted-foreground text-xs mb-3">
                  {task.abbreviation}
                </p>
                <p className="text-sm text-muted-foreground">
                  Assigned to {assignedUser?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${getPriorityColor(
                  task.priorityType
                )}`}
              />
              <Badge variant="outline" className="capitalize">
                {task.priorityType}
              </Badge>
              <TaskButton type="edit" task={task} onSubmit={onSubmit} />
              <DeleteTaskAlert onConfirm={handleDeleteTask} task={task}  />
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteTask}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Due:{" "}
                {task.dueDate
                  ? format(new Date(task.dueDate), "MMM d, yyyy")
                  : "No due date"}
              </span>
            </div>
            {task.dueDate &&
              new Date(task.dueDate) < new Date() &&
              !task.completed && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            {task.completed && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
