"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Task, User } from "@/db/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  FileText,
  CalendarClock,
  MessageSquare,
  Paperclip,
  Forward,
  Edit,
  Trash2,
  AlertCircle,
  User as UserIcon,
  CheckCircle2,
  Clock4,
  FileType,
  FileText as FileTextIcon,
  Image,
  FileSpreadsheet,
  Code,
  HelpCircle,
  Loader2,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DeleteTaskAlert } from "@/components/dashboard/delete-task-alert";
import { TaskForm } from "@/components/dashboard/task-form";
import { handleTaskAction } from "@/actions/tasks";
import TaskButton from "@/components/dashboard/task-button";
import { useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add interface for file attachment
interface FileAttachment {
  name: string;
  type: string;
  size?: string;
  url?: string;
}

// Dummy data
// const dummyTask: Task = {
//   id: 1,
//   abbreviation: "TASK-001",
//   description:
//     "Implement user authentication system with JWT tokens and refresh tokens",
//   assignedUserId: 1,
//   createdUserId: 1,
//   dueDate: "2024-04-15",
//   priorityType: "high",
//   completed: false,
//   status: "on_hold",
//   remarks:
//     "Please ensure to follow security best practices and include rate limiting",
//   files: [],
//   createdAt: new Date("2024-03-20"),
//   updatedAt: new Date("2024-03-24"),
// };

// Function to get file icon based on type
const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileType className="h-5 w-5 text-red-500" />;
    case "markdown":
    case "text":
      return <FileTextIcon className="h-5 w-5 text-blue-500" />;
    case "image":
      return <Image className="h-5 w-5 text-purple-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case "code":
      return <Code className="h-5 w-5 text-orange-500" />;
    default:
      return <HelpCircle className="h-5 w-5 text-gray-500" />;
  }
};

// Get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600";
    case "medium":
      return "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600";
    case "normal":
      return "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600";
    default:
      return "bg-gradient-to-r from-slate-500 to-slate-700";
  }
};

export default function TaskPage() {
  const { user: clerkUser } = useUser();
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [extensionReason, setExtensionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);

  const fetchUser = async (userId: number, user: "created" | "assigned") => {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    if (user === "created") {
      setCreatedUser(data as User);
    } else {
      setAssignedUser(data as User);
    }
  };
  // Add dummy attachments for UI demonstration
  const [attachments, setAttachments] = useState<FileAttachment[]>([
    {
      name: "requirements-doc.pdf",
      type: "pdf",
      size: "3.2 MB",
    },
    {
      name: "project-timeline.xlsx",
      type: "spreadsheet",
      size: "1.8 MB",
    },
    {
      name: "design-mockup.png",
      type: "image",
      size: "4.5 MB",
    },
    {
      name: "implementation-notes.md",
      type: "markdown",
      size: "645 KB",
    },
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(`/api/users`);
      const data = await response.json();

      setUsers(data.users as User[]);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch task data using taskId
    const fetchTask = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) {
          throw new Error(`Failed to load task: ${response.statusText}`);
        }
        const data: Task = await response.json();
        setTask(data);
        fetchUser(data.createdUserId as number, "created");
        fetchUser(data.assignedUserId as number, "assigned");
      } catch (error) {
        console.error("Error fetching task:", error);
        setError("Failed to load task. Please try again later.");
        toast.error("Failed to load task");
      } finally {
        setIsLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Error Loading Task
          </h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      toast.success("Task deleted successfully");
      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleUpdateTask = async (task: Task) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });
      router.refresh();
      setTask(task);
      toast.success("task saved successfully!");
    } catch (error) {
      toast.error("Some error went.");
    }
  };

  const handleRequestExtension = async () => {
    if (!newDueDate || !extensionReason) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!task) return;

    const newTask = { ...task };
    newTask.requestedDate = newDueDate;
    newTask.requestDateExtensionReason = extensionReason;

    await handleUpdateTask(newTask);
  };

  const handleApproveRequestDateExtension = async () => {
    if (!task) return;

    const newTask = { ...task };
    newTask.dueDate = newTask.requestedDate;
    newTask.requestedDate = null;
    newTask.requestDateExtensionReason = null;
    newTask.isRequestDateExtensionApproved = true;

    await handleUpdateTask(newTask);
  };

  const handleRejectRequestDateExtension = async () => {
    if (!task) return;

    const newTask = { ...task };
    newTask.requestedDate = null;
    newTask.requestDateExtensionReason = null;

    await handleUpdateTask(newTask);
  };

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : new Date();
  const isOverdue = dueDateObj < new Date() && !task.completed;

  const handleSubmit = async (
    type: "add" | "edit",
    task: Task,
    files?: FileList
  ) => {
    try {
      if (type === "edit") {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        // Update the local task state with the updated task
        const updatedTask = await response.json();
        setTask(updatedTask);
        toast.success("Task updated successfully");
      } else {
        // For adding tasks
        handleTaskAction(type, task);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  return (
    <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl bg-white shadow-lg p-6 border border-slate-100 max-w-7xl mx-auto"
      >
        {/* Header Section with Task Title and Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-100"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs font-bold bg-indigo-100 border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded-full"
              >
                {task?.abbreviation}
              </Badge>
              {task?.completed ? (
                <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 hover:bg-green-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </Badge>
              ) : isOverdue ? (
                <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 hover:bg-red-200 px-2.5 py-0.5 rounded-full">
                  <Clock4 className="h-3 w-3" /> Overdue
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 hover:bg-blue-200 px-2.5 py-0.5 rounded-full">
                  <Clock4 className="h-3 w-3" /> In Progress
                </Badge>
              )}
              <Badge
                className={`px-2.5 py-0.5 rounded-full ${
                  task?.priorityType === "high"
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                    : task?.priorityType === "medium"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                }`}
              >
                {task?.priorityType.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight line-clamp-2 mb-1">
              {task?.description}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 lg:mt-0 lg:flex-nowrap">
            {assignedUser?.email ===
              clerkUser?.emailAddresses[0].emailAddress &&
              task.status !== "completed" && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TaskButton type="edit" onSubmit={handleSubmit} task={task} />
                </motion.div>
              )}
            {(assignedUser?.email ===
              clerkUser?.emailAddresses[0].emailAddress ||
              createdUser?.email ===
                clerkUser?.emailAddresses[0].emailAddress) &&
              task.status !== "completed" && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm h-10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </motion.div>
              )}
            {(task.requestDateExtensionReason ||
              task.isRequestDateExtensionApproved) && (
              <motion.div>
                {/* Create alert dialog for accepting or rejecting the request for date extension. use shadcn alert dialog */}
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button variant="outline">View Request</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Accept the reques for extension?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <div className="mb-3">
                          <p className="text-xs">{task.requestedDate}</p>
                          <p className="text-black text-[17px]">
                            {task.requestDateExtensionReason}
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={handleRejectRequestDateExtension}
                      >
                        Reject
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleApproveRequestDateExtension}
                      >
                        Accept
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Remarks Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-3 border-b border-indigo-100 px-5 py-3">
                  <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                    Remarks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-slate-700 leading-relaxed">
                    {task?.remarks}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Attachments Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-3 border-b border-indigo-100 px-5 py-3">
                  <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-indigo-500" />
                    Attachments
                  </CardTitle>
                  <CardDescription className="text-indigo-500 text-xs">
                    Documents and resources for this task
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.length > 0 ? (
                      attachments.map((attachment, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{
                            scale: 1.01,
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                            borderColor: "#a5b4fc",
                          }}
                          className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all"
                        >
                          {getFileIcon(attachment.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate hover:text-indigo-600">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">
                              {attachment.type} · {attachment.size || "2.4 MB"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 17V3" />
                              <path d="m6 11 6 6 6-6" />
                              <path d="M19 21H5" />
                            </svg>
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50">
                        <Paperclip className="h-10 w-10 text-slate-300 mb-2" />
                        <p className="text-slate-500">
                          No attachments for this task
                        </p>
                        <Button variant="link" className="mt-2 text-indigo-600">
                          Upload Files
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Task Details Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-slate-200 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-3 border-b border-indigo-100 px-5 py-3">
                  <CardTitle className="text-base text-slate-800">
                    Task Details
                  </CardTitle>
                  <CardDescription className="text-indigo-500 text-xs">
                    Key information about this task
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-100 shadow-sm"
                    >
                      <div className="bg-indigo-100 rounded-full p-2 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-500">
                          Created by
                        </p>
                        <p className="font-medium text-slate-800 text-sm">
                          {createdUser?.name}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-100 shadow-sm"
                    >
                      <div className="bg-purple-100 rounded-full p-2 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-purple-500">
                          Assignee
                        </p>
                        <p className="font-medium text-slate-800 text-sm">
                          {assignedUser?.name}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-100 shadow-sm"
                    >
                      <div
                        className={`${
                          isOverdue ? "bg-red-100" : "bg-green-100"
                        } rounded-full p-2 flex items-center justify-center`}
                      >
                        <Calendar
                          className={`w-4 h-4 ${
                            isOverdue ? "text-red-600" : "text-green-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-500">
                          Due Date
                        </p>
                        <p
                          className={`font-medium text-sm ${
                            isOverdue ? "text-red-600" : "text-slate-800"
                          }`}
                        >
                          {task?.dueDate
                            ? format(new Date(task.dueDate), "PPP")
                            : "Not set"}
                          {isOverdue && (
                            <span className="text-red-500 text-xs ml-2 font-medium">
                              (Overdue)
                            </span>
                          )}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-100 shadow-sm"
                    >
                      <div className="bg-amber-100 rounded-full p-2 flex items-center justify-center">
                        <CalendarClock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-amber-500">
                          Created
                        </p>
                        <p className="font-medium text-slate-800 text-sm">
                          {task?.createdAt
                            ? format(new Date(task.createdAt), "PPP")
                            : "Unknown"}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-100 shadow-sm"
                    >
                      <div className="bg-cyan-100 rounded-full p-2 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-cyan-500">
                          Last Updated
                        </p>
                        <p className="font-medium text-slate-800 text-sm">
                          {task?.updatedAt
                            ? format(new Date(task.updatedAt), "PPP")
                            : "Unknown"}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions Section */}
            {assignedUser?.email ===
              clerkUser?.emailAddresses[0].emailAddress && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-3 border-b border-indigo-100 px-5 py-3">
                    <CardTitle className="text-base text-slate-800">
                      Actions
                    </CardTitle>
                    <CardDescription className="text-indigo-500 text-xs">
                      Available task operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Dialog>
                          <DialogTrigger className="w-full">
                            <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-sm h-9">
                              <Forward className="w-4 h-4 mr-2" />
                              {task.status
                                ? `Task Status: ${task.status?.toUpperCase()}`
                                : "In Progress"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Task Status</DialogTitle>
                              <DialogDescription>
                                <div className="space-y-2">
                                  <Label htmlFor="status">Status</Label>
                                  <Select
                                    name="status"
                                    value={
                                      task.status as "on_hold" | "completed"
                                    }
                                    onValueChange={(value) => {
                                      const newTask: Task = {
                                        ...task,
                                        completed: value === "completed",
                                        status: value as
                                          | "completed"
                                          | "on_hold",
                                      };
                                      setTask(newTask);
                                      handleUpdateTask(newTask);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="on_hold">
                                        On Hold
                                      </SelectItem>
                                      <SelectItem value="completed">
                                        Completed
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                      {task.status !== "completed" && (
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Dialog>
                            <DialogTrigger className="w-full">
                              <Button
                                disabled={task.status === "completed"}
                                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm h-9"
                              >
                                <Forward className="w-4 h-4 mr-2" />
                                Forward Task
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Forward Task...</DialogTitle>
                                <DialogDescription>
                                  <div className="space-y-2">
                                    <Label htmlFor="assignedUserId">
                                      Assign To
                                    </Label>
                                    <Select
                                      name="assignedUserId"
                                      value={task.assignedUserId?.toString()}
                                      onValueChange={(value) =>
                                        setTask((prev) => ({
                                          ...prev!,
                                          assignedUserId: Number(value),
                                        }))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select user" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {users?.map((user) => (
                                          <SelectItem
                                            key={user.id}
                                            value={user.id.toString()}
                                          >
                                            {user.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <div className="flex justify-end">
                                      <Button
                                        onClick={() => handleUpdateTask(task)}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </motion.div>
                      )}
                      {task.status !== "completed" && (
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={!!task.requestDateExtensionReason}
                            className="w-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm h-9"
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Request Extension
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {(isEditing || task.requestDateExtensionReason) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-3 p-4 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-inner"
                      >
                        <h3 className="font-medium text-amber-800 flex items-center gap-2 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          Request Due Date Extension
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label
                              htmlFor="newDueDate"
                              className="text-amber-800 mb-1 block text-xs"
                            >
                              New Due Date
                            </Label>
                            <Input
                              id="newDueDate"
                              type="date"
                              value={task.requestedDate || newDueDate}
                              onChange={(e) => setNewDueDate(e.target.value)}
                              className="border-amber-200 focus-visible:ring-amber-500 bg-white shadow-sm h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="extensionReason"
                              className="text-amber-800 mb-1 block text-xs"
                            >
                              Reason for Extension
                            </Label>
                            <Textarea
                              id="extensionReason"
                              value={
                                task.requestDateExtensionReason ||
                                extensionReason
                              }
                              onChange={(e) =>
                                setExtensionReason(e.target.value)
                              }
                              placeholder="Please explain why you need an extension..."
                              className="border-amber-200 focus-visible:ring-amber-500 bg-white shadow-sm min-h-20 text-sm"
                            />
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleRequestExtension}
                            disabled={
                              !!task.requestDateExtensionReason ||
                              task.status === "completed"
                            }
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm h-9"
                          >
                            Submit Request
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <DeleteTaskAlert
        task={showDeleteAlert ? task : null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteAlert(false)}
      />
    </div>
  );
}
