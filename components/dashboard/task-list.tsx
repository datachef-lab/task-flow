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
  ChevronLeft,
  ChevronRight,
  ListFilter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/hooks/use-auth";

interface TaskListProps {
  allTasks: Task[];
  filter?:
    | "all"
    | "pending"
    | "completed"
    | "overdue"
    | "date_extension"
    | "on_hold"
    | "assigned_by_me"
    | "assigned_to_me";
  users: User[];
  onSubmit: (type: "add" | "edit", task: Task) => Promise<void>;
  currentPage: number;
  isLoading: boolean;
  totalPages: number;
  totalTaskCount?: number; // The total number of tasks on the server
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSize: number;
  onTaskDelete: (taskId: number) => Promise<void>;
}

export function TaskList({
  filter,
  users,
  allTasks,
  currentPage,
  isLoading,
  totalPages,
  totalTaskCount,
  onPageChange,
  onPageSizeChange,
  pageSize,
  onSubmit,
  onTaskDelete,
}: TaskListProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [completionLoading, setCompletionLoading] = useState<number | null>(
    null
  );

  // Pagination state
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<number | null>(null);

  useEffect(() => {
    // Clean state update: only update when allTasks changes
    if (allTasks && JSON.stringify(allTasks) !== JSON.stringify(tasks)) {
      setTasks(allTasks);
    }
    setCurrentDate(new Date());
  }, [allTasks, currentPage]);

  // Toggle task completion function
  const toggleTaskCompletion = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (completionLoading === taskId) return; // Prevent multiple requests

    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const isConfirmed = confirm(
        `Do you want to ${!task.completed ? "complete" : "reopen"} ${
          task.abbreviation
        }?`
      );

      if (!isConfirmed) return;

      // Show loading state
      setCompletionLoading(taskId);

      // Optimistically update the UI
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );

      // Use the specific completeTask API endpoint
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task completion status");
      }

      const result = await response.json();
      if (result.success) {
        toast.success(
          `Task ${!task.completed ? "completed" : "reopened"} successfully`
        );
      } else {
        throw new Error(result.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
      // Revert the optimistic update if there was an error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? tasks.find((original) => original.id === taskId)!
            : t
        )
      );
      toast.error("Failed to update task");
    } finally {
      // Clear loading state
      setCompletionLoading(null);
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

  let filteredTasks = tasks || [];

  // Only keep search, priority and assignee filters client-side
  // Remove the status filtering since it's now handled server-side
  filteredTasks = filteredTasks.filter((task) => {
    // Filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.description?.toLowerCase().includes(query) ||
      task.abbreviation?.toLowerCase().includes(query) ||
      task.remarks?.toLowerCase().includes(query)
    );
  });

  filteredTasks = filteredTasks.filter((task) => {
    // Filter by priority
    if (!priorityFilter) return true;
    return task.priorityType === priorityFilter;
  });

  filteredTasks = filteredTasks.filter((task) => {
    // Filter by assignee
    if (!assigneeFilter) return true;
    return task.assignedUserId === assigneeFilter;
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

  // Use totalTaskCount from the server if provided, otherwise use the local filtered count
  const totalTasks =
    totalTaskCount !== undefined ? totalTaskCount : filteredTasks.length;
  const displayedTasks = filteredTasks;

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log("TaskList: handlePageChange called with page", page);
    onPageChange(page);
  };

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
    } else if (filter === "on_hold") {
      message = "No on-hold tasks";
      description = "All tasks are in progress or completed";
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

  // Generate pagination numbers
  const getPaginationItems = () => {
    const items = [];
    const maxPages = 5; // Max number of page links to show

    if (totalPages <= maxPages) {
      // Show all pages if totalPages <= maxPages
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPages - 1);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPages + 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        items.push("ellipsis1");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        items.push("ellipsis2");
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }

    return items;
  };

  // Task status badge
  const getStatusBadge = (task: Task) => {
    if (task.completed) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 hover:bg-emerald-200">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>
      );
    }

    if (task.status === "on_hold") {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 hover:bg-amber-200">
          <PauseCircle className="h-3 w-3" /> On Hold
        </Badge>
      );
    }

    if (
      task.dueDate &&
      currentDate &&
      isBefore(new Date(task.dueDate), currentDate)
    ) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 gap-1 hover:bg-red-200">
          <Clock className="h-3 w-3" /> Overdue
        </Badge>
      );
    }

    if (task.requestedDate && task.requestDateExtensionReason) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1 hover:bg-purple-200">
          <Calendar className="h-3 w-3" /> Extension Requested
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 hover:bg-blue-200">
        <Clock className="h-3 w-3" /> In Progress
      </Badge>
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Select
              value={priorityFilter || "all"}
              onValueChange={(value) =>
                setPriorityFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="h-9 w-[130px] bg-white border-slate-200 focus:ring-indigo-500">
                <div className="flex items-center gap-2 text-sm">
                  <ListFilter className="h-3.5 w-3.5 text-slate-500" />
                  {priorityFilter
                    ? priorityFilter.charAt(0).toUpperCase() +
                      priorityFilter.slice(1)
                    : "Priority"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={assigneeFilter?.toString() || "all"}
              onValueChange={(value) =>
                setAssigneeFilter(value === "all" ? null : Number(value))
              }
            >
              <SelectTrigger className="h-9 w-[130px] bg-white border-slate-200 focus:ring-indigo-500">
                <div className="flex items-center gap-2 text-sm truncate">
                  <ListFilter className="h-3.5 w-3.5 text-slate-500" />
                  {assigneeFilter
                    ? users
                        .find((u) => u.id === assigneeFilter)
                        ?.name?.split(" ")[0] || "Assignee"
                    : "Assignee"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1 font-medium"
          >
            {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
          </Badge>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && displayedTasks.length === 0 && (
        <div className="w-full flex justify-center items-center p-12 bg-white border border-slate-200 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 mb-4 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
            <p className="text-slate-700 text-lg font-medium">
              Loading tasks...
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Please wait while we fetch your data
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && displayedTasks.length === 0 ? (
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
            ) : filter === "on_hold" ? (
              <PauseCircle className="h-8 w-8 text-amber-500" />
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
              <TableHeader className="bg-gradient-to-r from-indigo-50/80 to-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead
                    className="font-semibold text-slate-700 w-[10%] whitespace-nowrap px-4 py-4"
                    onClick={() => handleSort("abbreviation")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700 transition-colors">
                      Task ID
                      {renderSortIcon("abbreviation")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold text-slate-700 w-[30%] px-4 py-4"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700 transition-colors">
                      Description
                      {renderSortIcon("description")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold text-slate-700 w-[12%] whitespace-nowrap px-4 py-4"
                    onClick={() => handleSort("dueDate")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700 transition-colors">
                      Due Date
                      {renderSortIcon("dueDate")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold text-slate-700 w-[12%] px-4 py-4"
                    onClick={() => handleSort("assignedUser")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700 transition-colors">
                      Assignee
                      {renderSortIcon("assignedUser")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold text-slate-700 w-[10%] px-4 py-4"
                    onClick={() => handleSort("priorityType")}
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-700 transition-colors">
                      Priority
                      {renderSortIcon("priorityType")}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[12%] text-center whitespace-nowrap px-4 py-4">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[14%] text-right px-4 py-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTasks.map((task, index) => {
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
                          : "hover:bg-indigo-50/30"
                      } cursor-pointer transition-colors border-b border-slate-100 last:border-0`}
                      onClick={() => handleRowClick(task.id)}
                    >
                      <TableCell className="font-medium py-4 px-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 font-medium px-2.5 py-0.5"
                          >
                            {task.abbreviation}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4 align-middle">
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
                                className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1 flex items-center px-2 py-0.5"
                              >
                                <AlertCircle className="h-3 w-3" />
                                Extension Requested
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4 whitespace-nowrap align-middle">
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

                      <TableCell className="py-4 px-4 align-middle">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Avatar className="h-7 w-7 border border-white bg-indigo-100 shadow-sm">
                            <AvatarFallback className="text-xs text-indigo-700 font-medium">
                              {assignedUser?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[100px] font-medium">
                            {assignedUser?.name || "Unassigned"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4 align-middle">
                        {getPriorityBadge(task.priorityType)}
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center">
                          {getStatusBadge(task)}

                          {task.status === "on_hold" && task.onHoldReason && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 ml-1"
                                  >
                                    <MessageSquare className="h-4 w-4 text-amber-500" />
                                    <span className="sr-only">View reason</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <div className="font-medium text-sm mb-1">
                                    On Hold Reason:
                                  </div>
                                  <div className="text-xs">
                                    {task.onHoldReason}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right py-4 px-4 align-middle">
                        <div className="flex items-center justify-end gap-1">
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
                                  disabled={completionLoading === task.id}
                                >
                                  {completionLoading === task.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <CheckCircle
                                      className={`h-4 w-4 ${
                                        task.completed ? "text-emerald-500" : ""
                                      }`}
                                    />
                                  )}
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

          {/* Pagination */}
          {totalPages > 1 && displayedTasks.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 gap-4 rounded-b-lg">
              <div className="flex items-center gap-2">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    onPageSizeChange(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px] bg-white border-slate-200 focus:ring-indigo-500">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-700">per page</span>
              </div>

              <div className="flex justify-center sm:justify-start">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1)
                            handlePageChange(currentPage - 1);
                        }}
                        className={`${
                          currentPage === 1
                            ? "opacity-50 pointer-events-none"
                            : "hover:bg-indigo-50 hover:text-indigo-700"
                        } transition-colors`}
                      />
                    </PaginationItem>

                    {getPaginationItems().map((item, i) => (
                      <PaginationItem key={i}>
                        {item === "ellipsis1" || item === "ellipsis2" ? (
                          <span className="flex h-9 w-9 items-center justify-center text-slate-400">
                            ...
                          </span>
                        ) : (
                          <PaginationLink
                            href="#"
                            isActive={currentPage === item}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(item as number);
                            }}
                            className={`${
                              currentPage === item
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-medium"
                                : "hover:bg-slate-50"
                            } transition-colors`}
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            handlePageChange(currentPage + 1);
                        }}
                        className={`${
                          currentPage === totalPages
                            ? "opacity-50 pointer-events-none"
                            : "hover:bg-indigo-50 hover:text-indigo-700"
                        } transition-colors`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>

              <div className="text-sm text-slate-500 text-center sm:text-right">
                Showing{" "}
                <span className="font-medium text-slate-900">
                  {totalTasks === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-900">
                  {Math.min(currentPage * pageSize, totalTasks)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">{totalTasks}</span>{" "}
                results
              </div>
            </div>
          )}
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
