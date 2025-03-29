"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";
import { Task, User } from "@/db/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DeleteTaskAlert } from "./delete-task-alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  ExternalLink,
  ArrowUpDown,
  Trash2,
  MessageSquare,
  PauseCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, isBefore } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskListProps {
  allTasks: Task[];
  filter?: "all" | "pending" | "completed" | "overdue" | "date_extension";
  users: User[];
  onSubmit: (type: "add" | "edit", task: Task) => Promise<void>;
  onTaskDelete: (taskId: number) => Promise<void>;
}

export function TaskList({
  filter,
  users,
  allTasks,
  onSubmit,
  onTaskDelete,
}: TaskListProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setTasks(allTasks);
    setCurrentDate(new Date());
  }, [allTasks]);

  const toggleTaskCompletion = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const isConfirmed = confirm(
        `Do you want to ${!task.completed ? "complete" : "reopen"} ${
          task.abbreviation
        }?`
      );

      if (!isConfirmed) return;

      // API call
      const updatedTask = { ...task, completed: !task.completed };
      await onSubmit("edit", updatedTask);

      // Optimistic update
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      toast.success("Task updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setTaskToDelete(task);
  };

  const handleDeleteConfirm = async (task: Task) => {
    try {
      // Optimistic update
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));

      // API call
      await onTaskDelete(task.id);
      toast.success("Task deleted successfully");
      setTaskToDelete(null);
      router.refresh();
    } catch (error) {
      // Rollback on error
      setTasks((prevTasks) => [...prevTasks, task]);
      toast.error("Failed to delete task");
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  const handleRowClick = (taskId: number) => {
    router.push(`/dashboard/${taskId}`);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get user by ID
  const getUserById = (userId: number | null): User | undefined => {
    return users.find((user) => user.id === userId);
  };

  // Priority styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            HIGH
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            MEDIUM
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            NORMAL
          </Badge>
        );
    }
  };

  let filteredTasks = tasks
    .filter((task) => {
      // Filter by status
      if (filter === "pending") return !task.completed;
      if (filter === "completed") return task.completed;
      if (filter === "overdue")
        return (
          !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
        );
      if (filter === "date_extension")
        return !!task.requestedDate && !!task.requestDateExtensionReason;
      return true;
    })
    .filter((task) => {
      // Filter by search query
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        task.description?.toLowerCase().includes(query) ||
        task.abbreviation?.toLowerCase().includes(query) ||
        task.remarks?.toLowerCase().includes(query)
      );
    });

  // Sort tasks
  if (sortField) {
    filteredTasks = [...filteredTasks].sort((a, b) => {
      let aValue: any = (a as any)[sortField];
      let bValue: any = (b as any)[sortField];

      // Handle specific fields
      if (sortField === "dueDate") {
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      } else if (sortField === "assignedUser") {
        const aUser = getUserById(a.assignedUserId as number);
        const bUser = getUserById(b.assignedUserId as number);
        aValue = aUser?.name || "";
        bValue = bUser?.name || "";
      } else if (sortField === "createdUser") {
        const aUser = getUserById(a.createdUserId as number);
        const bUser = getUserById(b.createdUserId as number);
        aValue = aUser?.name || "";
        bValue = bUser?.name || "";
      }

      // Compare values
      if (aValue === bValue) return 0;

      const compareResult = aValue > bValue ? 1 : -1;
      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  }

  const noTasksMessage = () => {
    let message = "No tasks found";
    let description = "Create a new task to get started";

    if (filter === "pending") {
      message = "No pending tasks";
      description = "All tasks have been completed!";
    } else if (filter === "completed") {
      message = "No completed tasks";
      description = "Start completing your pending tasks";
    } else if (filter === "overdue") {
      message = "No overdue tasks";
      description = "You're up to date with all deadlines!";
    } else if (filter === "date_extension") {
      message = "No extension requests";
      description = "There are no pending extension requests";
    } else if (searchQuery) {
      message = "No matching tasks";
      description = `No tasks found matching "${searchQuery}"`;
    }

    return { message, description };
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3" />;
    return sortDirection === "asc" ? (
      <ArrowUpDown className="ml-1 h-3 w-3 text-indigo-600" />
    ) : (
      <ArrowUpDown className="ml-1 h-3 w-3 text-indigo-600" />
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Search and filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 w-full bg-white border-slate-200 focus-visible:ring-indigo-500"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
            >
              ×
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 self-end">
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-700 px-3 py-1"
          >
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"}
          </Badge>
        </div>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full"
        >
          <div className="bg-white p-4 rounded-full border border-slate-200 shadow-sm mb-4">
            {filter === "completed" ? (
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            ) : filter === "overdue" ? (
              <Clock className="h-8 w-8 text-red-500" />
            ) : filter === "date_extension" ? (
              <AlertCircle className="h-8 w-8 text-amber-500" />
            ) : (
              <PlusCircle className="h-8 w-8 text-indigo-500" />
            )}
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-1">
            {noTasksMessage().message}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {noTasksMessage().description}
          </p>
        </motion.div>
      ) : (
        <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden w-full">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <TableRow>
                  <TableHead
                    className="font-semibold text-slate-700 w-[10%] whitespace-nowrap px-4 py-3.5"
                    onClick={() => handleSort("abbreviation")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700">
                      Task ID
                      {renderSortIcon("abbreviation")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold text-slate-700 w-[30%] px-4 py-3.5"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700">
                      Description
                      {renderSortIcon("description")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold text-slate-700 w-[12%] whitespace-nowrap px-4 py-3.5"
                    onClick={() => handleSort("dueDate")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700">
                      Due Date
                      {renderSortIcon("dueDate")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold text-slate-700 w-[12%] px-4 py-3.5"
                    onClick={() => handleSort("assignedUser")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700">
                      Assignee
                      {renderSortIcon("assignedUser")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold text-slate-700 w-[10%] px-4 py-3.5"
                    onClick={() => handleSort("priorityType")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700">
                      Priority
                      {renderSortIcon("priorityType")}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[12%] text-center whitespace-nowrap px-4 py-3.5">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[14%] text-right px-4 py-3.5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task, index) => {
                  const isOverdue =
                    task.dueDate &&
                    !task.completed &&
                    isBefore(new Date(task.dueDate), new Date());

                  const assignedUser = getUserById(
                    task.assignedUserId as number
                  );
                  const createdUser = getUserById(task.createdUserId as number);

                  return (
                    <TableRow
                      key={task.id}
                      className={`${
                        task.completed
                          ? "bg-slate-50/80"
                          : "hover:bg-slate-50/80"
                      } cursor-pointer transition-colors border-b border-slate-100 last:border-0`}
                      onClick={() => handleRowClick(task.id)}
                    >
                      <TableCell className="font-medium py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                          >
                            {task.abbreviation}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4">
                        <div className="max-w-full pr-4">
                          <div
                            className={`font-medium ${
                              task.completed
                                ? "text-slate-500"
                                : "text-slate-800"
                            } truncate`}
                          >
                            {task.description}
                          </div>
                          {task.requestDateExtensionReason && (
                            <div className="mt-1.5 flex items-center">
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1 flex items-center"
                              >
                                <AlertCircle className="h-3 w-3" />
                                Extension Requested
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            className={`h-3.5 w-3.5 ${
                              isOverdue ? "text-red-500" : "text-slate-400"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isOverdue
                                ? "text-red-600 font-medium"
                                : "text-slate-600"
                            }`}
                          >
                            {task.dueDate
                              ? format(new Date(task.dueDate), "MMM d, yyyy")
                              : "—"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Avatar className="h-7 w-7 border border-white bg-indigo-100 shadow-sm">
                            <AvatarFallback className="text-xs text-indigo-700">
                              {assignedUser?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[100px]">
                            {assignedUser?.name || "Unassigned"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4">
                        {getPriorityBadge(task.priorityType)}
                      </TableCell>

                      <TableCell className="text-center py-4 px-4 whitespace-nowrap">
                        {task.completed ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-xs font-medium py-1 px-2">
                            <CheckCircle className="h-3 w-3" /> Complete
                          </Badge>
                        ) : isOverdue ? (
                          <Badge className="bg-red-100 text-red-800 border-red-200 gap-1 text-xs font-medium py-1 px-2">
                            <Clock className="h-3 w-3" /> Overdue
                          </Badge>
                        ) : task.status === "on_hold" ? (
                          <Badge className="bg-slate-100 text-slate-800 border-slate-200 gap-1 text-xs font-medium py-1 px-2">
                            <PauseCircle className="h-3 w-3" /> On Hold
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-xs font-medium py-1 px-2">
                            <Clock className="h-3 w-3" /> In Progress
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                  onClick={(e) =>
                                    toggleTaskCompletion(task.id, e)
                                  }
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                {task.completed
                                  ? "Mark as incomplete"
                                  : "Mark as complete"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                  onClick={(e) => handleDeleteClick(task, e)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                Delete task
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                  onClick={() => handleRowClick(task.id)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                View task details
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <DeleteTaskAlert
        task={taskToDelete}
        onConfirm={() => taskToDelete && handleDeleteConfirm(taskToDelete)}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
