"use client";

import { Task, User } from "@/db/schema";
import { DashboardShell } from "../dashboard-shell";
import { DashboardContent } from "./dashboard-content";

type DashboardWrapperProps = {
  tasks: Task[];
  users: User[];
  handleSubmit: (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => Promise<void>;
  assignedByMe: Task[];
  assignedToMe: Task[];
};

export default function DashboardWrapper({
  tasks,
  users,
  handleSubmit,
  assignedByMe,
  assignedToMe,
}: DashboardWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid flex-1">
        <DashboardShell>
          <DashboardContent
            initialTasks={tasks || []}
            users={users || []}
            onSubmit={handleSubmit}
          />
        </DashboardShell>
      </div>
    </div>
  );
}
