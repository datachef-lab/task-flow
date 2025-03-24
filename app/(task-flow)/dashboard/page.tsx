import { Task, User } from "@/db/schema";
import { getAllTasks } from "@/lib/services/task-service";
import { getAllUsers } from "@/lib/services/user-service";
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";
import { handleTaskAction } from "@/actions/tasks";
import { Suspense } from "react";

export default async function DashboardPage() {
  try {
    const [{ tasks }, { users }] = await Promise.all([
      getAllTasks(),
      getAllUsers(),
    ]);

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardWrapper
          tasks={tasks || []}
          users={users || []}
          handleSubmit={handleTaskAction}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">
            Error Loading Dashboard
          </h1>
          <p className="text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }
}
