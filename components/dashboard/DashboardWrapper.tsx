"use client";

import { Task, User } from "@/db/schema";
import { DashboardShell } from "../dashboard-shell";
import { DashboardContent } from "./dashboard-content";

type DashboardWrapperProps = {
  users: User[];
  handleSubmit: (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => Promise<void>;
};

export default function DashboardWrapper({
  users,
  handleSubmit,
}: DashboardWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid flex-1">
        <DashboardShell>
          <DashboardContent users={users || []} onSubmit={handleSubmit} />
        </DashboardShell>
      </div>
    </div>
  );
}
