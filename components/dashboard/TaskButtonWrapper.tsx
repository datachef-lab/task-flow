// Separate client component for interactive elements
"use client";

import TaskButton from "./task-button";
import { Task } from "@/db/schema";

type TaskButtonWrapperProps = {
  onSubmit: (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => Promise<void>;
};

export default function TaskButtonWrapper({
  onSubmit,
}: TaskButtonWrapperProps) {
  return <TaskButton type="add" onSubmit={onSubmit} />;
}
