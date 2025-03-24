"use client";

import { Task } from "@/db/schema";
import React, { useEffect, useState } from "react";
import { TableCell } from "../ui/table";

export default function TaskCell({ taskId }: { taskId: number }) {
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    const response = await fetch(`/api/tasks/${taskId}`);
    const data = await response.json();
    setTask(data as Task);
  };
  return (
    <>
      <TableCell className="font-medium">{task?.abbreviation}</TableCell>
      <TableCell className="font-medium">{task?.description}</TableCell>
    </>
  );
}
