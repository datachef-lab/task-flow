import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaskList } from "@/components/TaskList";

const DashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "completed" | "overdue" | "date_extension"
  >("all");

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const handleSubmit = (task: any) => {
    // Implementation of handleSubmit
  };

  const handleTaskDelete = (taskId: string) => {
    // Implementation of handleTaskDelete
  };

  return (
    <div>
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
    </div>
  );
};

export default DashboardContent;
