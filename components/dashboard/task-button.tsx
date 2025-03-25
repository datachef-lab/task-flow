"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/db/schema";
import { TaskForm } from "./task-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";

type TaskButtonProps = {
  type: "add" | "edit";
  task?: Task;
  onSubmit: (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => Promise<void>;
};

export default function TaskButton({ type, task, onSubmit }: TaskButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: Partial<Task>, files?: FileList) => {
    try {
      if (type === "add") {
        await onSubmit("add", formData as Task, files);
      } else if (task) {
        await onSubmit("edit", { ...task, ...formData } as Task, files);
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to submit task:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "edit" ? (
          <Button
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm h-10"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : (
          <Button
            variant="default"
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {type === "add" ? "Add New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>
        <TaskForm task={task} type={type} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
