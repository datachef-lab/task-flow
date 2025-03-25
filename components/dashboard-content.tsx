import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaskList } from "@/components/task-list";
import { TaskStats } from "@/types";

export function DashboardContent({
  users,
  initialTasks,
  onSubmit,
}: DashboardContentProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "completed" | "overdue" | "date_extension"
  >("all");
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });

  // ... existing code ...

  // Tabs
  return (
    <main className="container flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* ... existing header code ... */}

      {/* Stats Cards */}
      {/* ... existing stats cards ... */}

      {/* Tabs */}
      <Tabs
        defaultValue="all"
        className="mt-6"
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="date_extension">Date Extension</TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="all" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter={undefined}
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter="pending"
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter="completed"
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter="overdue"
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
        <TabsContent value="date_extension" className="mt-4">
          <TaskList
            users={users}
            allTasks={tasks}
            filter="date_extension"
            onSubmit={handleSubmit}
            onTaskDelete={handleTaskDelete}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
