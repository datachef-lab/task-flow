"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import TaskButton from "./task-button";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  ArrowRight,
  User,
  MessageSquare,
  PauseCircle,
} from "lucide-react";
import { Task, User } from "@/db/schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignedUser = async () => {
      const user = await fetchUserById(task.assignedUserId as number);
      setAssignedUser(user as User);
    };
    const fetchCreatedUser = async () => {
      const user = await fetchUserById(task.createdUserId as number);
      setCreatedUser(user as User);
    };

    fetchAssignedUser();
    fetchCreatedUser();
  }, [task.assignedUserId, task.createdUserId]);

  const fetchUserById = async (id: number) => {
    const response = await fetch(`/api/users/${id}`);
    return await response.json();
  };

  const toggleTaskCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
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

  const handleDeleteTask = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    await onDeleteClick();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
          border: "border-red-300",
          text: "text-red-700",
          hover: "hover:bg-red-50",
          icon: "text-red-500",
          light: "bg-red-50",
        };
      case "medium":
        return {
          bg: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
          border: "border-amber-300",
          text: "text-amber-700",
          hover: "hover:bg-amber-50",
          icon: "text-amber-500",
          light: "bg-amber-50",
        };
      case "normal":
      default:
        return {
          bg: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
          border: "border-blue-300",
          text: "text-blue-700",
          hover: "hover:bg-blue-50",
          icon: "text-blue-500",
          light: "bg-blue-50",
        };
    }
  };

  const priorityStyles = getPriorityColor(task.priorityType);

  const handleCardClick = () => {
    const taskId = task.id;
    router.push(`/dashboard/${taskId}`);
  };

  // Check if the task is overdue
  const isOverdue =
    task.dueDate &&
    !task.completed &&
    isBefore(new Date(task.dueDate), new Date());

  // Format the due date
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "MMM d, yyyy")
    : "No due date";

  return (
    <Card
      className={`overflow-hidden border-slate-200 ${
        task.completed ? "bg-slate-50" : "bg-white"
      } shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between gap-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant="outline"
              className="text-xs font-medium bg-indigo-100 border-indigo-200 text-indigo-700 px-2"
            >
              {task.abbreviation}
            </Badge>

            {task.completed ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1 px-2 text-xs">
                <CheckCircle className="h-3 w-3" /> Completed
              </Badge>
            ) : isOverdue ? (
              <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 px-2 text-xs">
                <Clock className="h-3 w-3" /> Overdue
              </Badge>
            ) : task.status === "on_hold" ? (
              <Badge className="bg-slate-100 text-slate-800 border-slate-200 flex items-center gap-1 px-2 text-xs">
                <PauseCircle className="h-3 w-3" /> On Hold
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 px-2 text-xs">
                <Clock className="h-3 w-3" /> In Progress
              </Badge>
            )}

            <Badge className={`px-2 text-xs ${priorityStyles.bg}`}>
              {task.priorityType.toUpperCase()}
            </Badge>
          </div>

          <h3
            className={`font-medium text-base ${
              task.completed ? "text-slate-500" : "text-slate-800"
            } line-clamp-2`}
          >
            {task.description}
          </h3>
        </div>

        <div className="flex gap-1">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                  onClick={(e) => toggleTaskCompletion(e)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {task.completed ? "Mark as incomplete" : "Mark as complete"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                  onClick={(e) => handleDeleteTask(e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Delete task</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {task.remarks && (
          <div className="mb-3 text-sm text-slate-600 line-clamp-2 flex gap-2 items-start">
            <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p>{task.remarks}</p>
          </div>
        )}

        {task.requestDateExtensionReason && (
          <div className="mb-3 py-1.5 px-2.5 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-amber-700">Extension Requested</p>
              <p className="text-amber-600 line-clamp-1">
                {task.requestDateExtensionReason}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar
              className={`h-3.5 w-3.5 ${
                isOverdue ? "text-red-500" : "text-slate-400"
              }`}
            />
            <span
              className={`text-xs ${
                isOverdue ? "text-red-600 font-medium" : "text-slate-500"
              }`}
            >
              {formattedDueDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 border border-white bg-indigo-100">
              <AvatarFallback className="text-xs text-indigo-700">
                {assignedUser?.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

/*
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
                <DeleteTaskAlert onConfirm={handleDeleteTask} task={task} />
                {/* <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteTask}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button> 
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
*/
