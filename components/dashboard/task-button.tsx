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
        <Button variant={type === "edit" ? "ghost" : "destructive"}>
          {type === "add" ? (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </>
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "add" ? "Add New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>
        <TaskForm task={task} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
