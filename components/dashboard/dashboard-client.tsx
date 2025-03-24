"use client";

import { Task, User } from "@/db/schema";
import DashboardWrapper from "./DashboardWrapper";

type DashboardClientProps = {
  tasks: Task[];
  users: User[];
};

export function DashboardClient({ tasks, users }: DashboardClientProps) {
  return <DashboardWrapper tasks={tasks} users={users} />;
}
