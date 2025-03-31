// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// import { Task, User } from "@/db/schema";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Calendar,
//   Clock,
//   FileText,
//   CalendarClock,
//   MessageSquare,
//   Paperclip,
//   Forward,
//   Edit,
//   Trash2,
//   AlertCircle,
//   User as UserIcon,
//   CheckCircle2,
//   Clock4,
//   FileType,
//   FileText as FileTextIcon,
//   Image,
//   FileSpreadsheet,
//   Code,
//   HelpCircle,
//   Loader2,
//   Trash,
//   PauseCircle,
//   CheckCircle,
//   Repeat,
// } from "lucide-react";
// import { format } from "date-fns";
// import { motion } from "framer-motion";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { DeleteTaskAlert } from "@/components/dashboard/delete-task-alert";
// import { TaskForm } from "@/components/dashboard/task-form";
// import { handleTaskAction } from "@/actions/tasks";
// import TaskButton from "@/components/dashboard/task-button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useAuth } from "@/hooks/use-auth";

// // Ensure the TaskFile interface is properly defined at the top of the file
// interface TaskFile {
//   name: string;
//   path: string;
//   type: string;
//   size?: string;
// }

// // Add interface for file attachment
// interface FileAttachment {
//   name: string;
//   type: string;
//   size?: string;
//   url?: string;
// }

// // Dummy data
// // const dummyTask: Task = {
// //   id: 1,
// //   abbreviation: "TASK-001",
// //   description:
// //     "Implement user authentication system with JWT tokens and refresh tokens",
// //   assignedUserId: 1,
// //   createdUserId: 1,
// //   dueDate: "2024-04-15",
// //   priorityType: "high",
// //   completed: false,
// //   status: "on_hold",
// //   remarks:
// //     "Please ensure to follow security best practices and include rate limiting",
// //   files: [],
// //   createdAt: new Date("2024-03-20"),
// //   updatedAt: new Date("2024-03-24"),
// // };

// // Function to get file icon based on type
// const getFileIcon = (type: string) => {
//   switch (type) {
//     case "pdf":
//       return <FileType className="h-5 w-5 text-red-500" />;
//     case "markdown":
//     case "text":
//       return <FileTextIcon className="h-5 w-5 text-blue-500" />;
//     case "image":
//       return <Image className="h-5 w-5 text-purple-500" />;
//     case "spreadsheet":
//       return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
//     case "code":
//       return <Code className="h-5 w-5 text-orange-500" />;
//     default:
//       return <HelpCircle className="h-5 w-5 text-gray-500" />;
//   }
// };

// // Get priority color
// const getPriorityColor = (priority: string) => {
//   switch (priority) {
//     case "high":
//       return "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600";
//     case "medium":
//       return "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600";
//     case "normal":
//       return "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600";
//     default:
//       return "bg-gradient-to-r from-slate-500 to-slate-700";
//   }
// };

// export default function TaskPage() {
//   const { user: currentUser } = useAuth();
//   const { taskId } = useParams<{ taskId: string }>();
//   const router = useRouter();
//   const [task, setTask] = useState<Task | null>();
//   const [showDeleteAlert, setShowDeleteAlert] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [newDueDate, setNewDueDate] = useState<string>("");
//   const [extensionReason, setExtensionReason] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [createdUser, setCreatedUser] = useState<User | null>(null);
//   const [users, setUsers] = useState<User[]>([]);
//   const [assignedUser, setAssignedUser] = useState<User | null>(null);

//   const fetchUser = async (userId: number, user: "created" | "assigned") => {
//     const response = await fetch(`/api/users/${userId}`);
//     const data = await response.json();
//     if (user === "created") {
//       setCreatedUser(data as User);
//     } else {
//       setAssignedUser(data as User);
//     }
//   };

//   // Function to identify file type from extension
//   const getFileType = (fileName: string): string => {
//     const extension = fileName.split(".").pop()?.toLowerCase() || "";

//     if (["pdf"].includes(extension)) return "pdf";
//     if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(extension))
//       return "image";
//     if (["doc", "docx", "txt", "md", "rtf"].includes(extension)) return "text";
//     if (["xls", "xlsx", "csv"].includes(extension)) return "spreadsheet";
//     if (
//       [
//         "js",
//         "ts",
//         "jsx",
//         "tsx",
//         "html",
//         "css",
//         "java",
//         "py",
//         "c",
//         "cpp",
//       ].includes(extension)
//     )
//       return "code";

//     return "unknown";
//   };

//   // Function to download a file
//   const handleFileDownload = async (filePath: string, fileName: string) => {
//     try {
//       console.log("Attempting to download file:", { filePath, fileName });

//       // Show loading toast
//       const toastId = toast.loading(`Starting download for ${fileName}...`);

//       // Handle file path - original format is typically: /documents/{taskId}/{fileName}
//       // For the download API we want to pass the relative path
//       if (!filePath) {
//         toast.error("Invalid file path", { id: toastId });
//         return;
//       }

//       // Create a direct path to the file in the task's directory
//       // Using the download API which accepts path relative to process.cwd()
//       // This is more reliable than trying to parse the existing path
//       const downloadPath = `documents/${taskId}/${fileName}`;
//       console.log("Using download path:", downloadPath);

//       // Trigger the download by opening the URL in a new tab
//       const downloadUrl = `/api/download?path=${encodeURIComponent(
//         downloadPath
//       )}`;
//       console.log("Download URL:", downloadUrl);

//       // Use window.open for direct download
//       window.open(downloadUrl, "_blank");

//       // Update the toast to success
//       toast.success(`Download started for ${fileName}`, { id: toastId });
//     } catch (error) {
//       console.error("Error downloading file:", error);
//       toast.error(
//         error instanceof Error
//           ? error.message
//           : "Failed to download file. Please try again."
//       );
//     }
//   };

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const response = await fetch(`/api/users`);
//       const data = await response.json();

//       setUsers(data.users as User[]);
//     };

//     fetchUsers();
//   }, []);

//   const fetchTask = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(`/api/tasks/${taskId}`);
//       if (!response.ok) {
//         throw new Error(`Failed to load task: ${response.statusText}`);
//       }
//       const data: Task = await response.json();
//       setTask(data);
//       fetchUser(data.createdUserId as number, "created");
//       fetchUser(data.assignedUserId as number, "assigned");
//     } catch (error) {
//       console.error("Error fetching task:", error);
//       setError("Failed to load task. Please try again later.");
//       toast.error("Failed to load task");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Fetch task data using taskId

//     if (taskId) {
//       fetchTask();
//     }
//   }, [taskId]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="flex flex-col items-center gap-2">
//           <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//           <p className="text-slate-600">Loading task...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="max-w-md p-6 text-center">
//           <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-slate-800 mb-2">
//             Error Loading Task
//           </h2>
//           <p className="text-slate-600 mb-4">{error}</p>
//           <Button onClick={() => router.push("/dashboard")} variant="outline">
//             Return to Dashboard
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (!task) return null;

//   const handleDelete = () => {
//     setShowDeleteAlert(true);
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       const response = await fetch(`/api/tasks/${task.id}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         throw new Error("Failed to delete task");
//       }
//     toast.success("Task deleted successfully");
//       router.refresh();
//     router.push("/dashboard");
//     } catch (error) {
//       console.error("Error deleting task:", error);
//       toast.error("Failed to delete task");
//     }
//   };

//   const handleUpdateTask = async (task: Task) => {
//     try {
//       //   setIsLoading(true);
//       const response = await fetch(`/api/tasks/${taskId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(task),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update task");
//       }

//       const updatedTask = await response.json();
//       setTask(updatedTask);

//       // Fetch updated user data
//       if (updatedTask.assignedUserId) {
//         await fetchUser(updatedTask.assignedUserId, "assigned");
//       }

//       try {
//         const response = await fetch(`/api/tasks/${taskId}`);
//         if (!response.ok) {
//           throw new Error(`Failed to load task: ${response.statusText}`);
//         }
//         const data: Task = await response.json();
//         setTask(data);
//         fetchUser(data.createdUserId as number, "created");
//         fetchUser(data.assignedUserId as number, "assigned");
//       } catch (error) {
//         console.error("Error fetching task:", error);
//         setError("Failed to load task. Please try again later.");
//         toast.error("Failed to load task");
//       } finally {
//       }

//       toast.success("Task updated successfully!");
//     } catch (error) {
//       console.error("Error updating task:", error);
//       toast.error("Failed to update task");
//     } finally {
//       //   setIsLoading(false);
//       router.refresh();
//     }
//   };

//   const handleRequestExtension = async () => {
//     if (!newDueDate || !extensionReason) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     if (!task) return;

//     const newTask = { ...task };
//     newTask.requestedDate = newDueDate;
//     newTask.requestDateExtensionReason = extensionReason;
//     console.log("updating for request:", newTask);
//     setTask(newTask);

//     await handleUpdateTask(newTask);
//   };

//   const handleApproveRequestDateExtension = async () => {
//     if (!task) return;

//     const newTask = { ...task };
//     newTask.dueDate = newTask.requestedDate;
//     newTask.requestedDate = null;
//     newTask.requestDateExtensionReason = null;
//     newTask.isRequestDateExtensionApproved = true;

//     await handleUpdateTask(newTask);
//   };

//   const handleRejectRequestDateExtension = async () => {
//     if (!task) return;

//     const newTask = { ...task };
//     newTask.requestedDate = null;
//     newTask.requestDateExtensionReason = null;

//     await handleUpdateTask(newTask);
//   };

//   const dueDateObj = task.dueDate ? new Date(task.dueDate) : new Date();
//   const isOverdue = dueDateObj < new Date() && !task.completed;

//   const handleSubmit = async (
//     type: "add" | "edit",
//     task: Task,
//     files?: FileList
//   ) => {
//     try {
//       if (type === "edit") {
//         const response = await fetch(`/api/tasks/${task.id}`, {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(task),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to update task");
//         }

//         // Update the local task state with the updated task
//         const updatedTask = await response.json();
//         setTask(updatedTask);
//         toast.success("Task updated successfully");
//       } else {
//         // For adding tasks
//         handleTaskAction(type, task);
//       }
//     } catch (error) {
//       console.error("Error updating task:", error);
//       toast.error("Failed to update task");
//     }
//   };

//   return (
//     <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="rounded-xl bg-white shadow-xl p-6 border border-slate-100 max-w-7xl mx-auto"
//       >
//         {/* Header Section with Task Title and Actions */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.4, delay: 0.2 }}
//           className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-200"
//         >
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-2 flex-wrap">
//                 <Badge
//                   variant="outline"
//                 className="text-xs font-bold bg-indigo-100 border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded-full"
//                 >
//                 {task?.abbreviation}
//               </Badge>
//               {task?.completed ? (
//                 <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1 hover:bg-emerald-200 px-2.5 py-0.5 rounded-full">
//                   <CheckCircle2 className="h-3 w-3" /> Completed
//                 </Badge>
//               ) : isOverdue ? (
//                 <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 hover:bg-red-200 px-2.5 py-0.5 rounded-full">
//                   <Clock4 className="h-3 w-3" /> Overdue
//                 </Badge>
//               ) : (
//                 <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 hover:bg-blue-200 px-2.5 py-0.5 rounded-full">
//                   <Clock4 className="h-3 w-3" /> In Progress
//                 </Badge>
//               )}
//               <Badge
//                 className={`px-3 py-0.5 rounded-full ${
//                   task?.priorityType === "high"
//                     ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
//                     : task?.priorityType === "medium"
//                     ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
//                     : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
//                 }`}
//               >
//                 {task?.priorityType.toUpperCase()} PRIORITY
//               </Badge>
//             </div>
//             <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 leading-tight mb-2">
//               {task?.description}
//             </h1>
//             <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
//               <div className="flex items-center gap-1">
//                 <UserIcon className="h-4 w-4 text-slate-400" />
//                 <span>{assignedUser?.name}</span>
//           </div>
//               <div className="flex items-center gap-1">
//                 <Calendar className="h-4 w-4 text-slate-400" />
//                 <span>
//                   {task?.dueDate
//                     ? format(new Date(task.dueDate), "PPP")
//                     : "No due date"}
//                 </span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Clock className="h-4 w-4 text-slate-400" />
//                 <span>
//                   Updated{" "}
//                   {task?.updatedAt
//                     ? format(new Date(task.updatedAt), "PPP")
//                     : "Unknown"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-2 mt-4 lg:mt-0 lg:flex-nowrap">
//             {/* Edit button - only shown when user is the assignee AND task is not on hold AND not completed */}
//             {assignedUser?.email ===
//               currentUser?.email &&
//               !task.completed &&
//               task.status !== "on_hold" && (
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <TaskButton type="edit" onSubmit={handleSubmit} task={task} />
//                 </motion.div>
//               )}
//             {/* Delete button - shown to assigned user or creator when not completed */}
//             {(assignedUser?.email ===
//               currentUser?.email ||
//               createdUser?.email ===
//                 currentUser?.email) &&
//               !task.completed && (
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//             <Button
//               variant="outline"
//               onClick={handleDelete}
//                     className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm h-10"
//             >
//               <Trash2 className="w-4 h-4 mr-2" />
//               Delete
//             </Button>
//                 </motion.div>
//               )}
//             {/* Extension request view button */}
//             {(task.requestDateExtensionReason ||
//               task.isRequestDateExtensionApproved) &&
//               (createdUser?.email ===
//                 currentUser?.email ||
//                 assignedUser?.email ===
//                   currentUser?.email) && (
//                 <motion.div>
//                   <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 h-10"
//                       >
//                         <AlertCircle className="w-4 h-4 mr-2" />
//                         View Extension Request
//                       </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent className="max-w-md">
//                       <AlertDialogHeader>
//                         <AlertDialogTitle className="text-xl text-slate-800">
//                           Extension Request
//                         </AlertDialogTitle>
//                         <AlertDialogDescription>
//                           <div className="mb-4 space-y-3">
//                             <div>
//                               <p className="text-xs text-slate-500">
//                                 Requested New Due Date:
//                               </p>
//                               <p className="text-base font-medium text-slate-800">
//                                 {format(
//                                   new Date(task.requestedDate || new Date()),
//                                   "PPP"
//                                 )}
//                               </p>
//           </div>
//                             <div>
//                               <p className="text-xs text-slate-500">Reason:</p>
//                               <p className="text-base text-slate-800 p-3 bg-slate-50 rounded-md border border-slate-200">
//                                 {task.requestDateExtensionReason}
//                               </p>
//         </div>
//                           </div>
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <AlertDialogFooter className="gap-2">
//                         <AlertDialogCancel
//                           onClick={handleRejectRequestDateExtension}
//                           className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
//                         >
//                           Reject Request
//                         </AlertDialogCancel>
//                         <AlertDialogAction
//                           onClick={handleApproveRequestDateExtension}
//                           className="bg-emerald-600 hover:bg-emerald-700"
//                         >
//                           Approve Extension
//                         </AlertDialogAction>
//                       </AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </motion.div>
//               )}
//           </div>
//         </motion.div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 space-y-6">
//             {/* On-hold Reason Section - visible to all users */}
//             {task.status === "on_hold" && task.onHoldReason && (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.5, delay: 0.3 }}
//               >
//                 <Card className="overflow-hidden border-amber-200 shadow-md hover:shadow-lg transition-shadow">
//                   <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-4 border-b border-amber-200 px-6 py-4">
//                     <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
//                       <PauseCircle className="h-5 w-5 text-amber-600" />
//                       Task On Hold
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-6">
//                     <p className="text-amber-800 font-medium mb-2">Reason:</p>
//                     <p className="leading-relaxed text-slate-700 p-3 bg-amber-50 rounded-md border border-amber-100">
//                       {task.onHoldReason}
//                     </p>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             )}

//             {/* Extension Request Section - visible to all users */}
//             {task.requestDateExtensionReason && (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.5, delay: 0.35 }}
//               >
//                 <Card className="overflow-hidden border-amber-200 shadow-md hover:shadow-lg transition-shadow">
//                   <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-4 border-b border-amber-200 px-6 py-4">
//                     <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
//                       <AlertCircle className="h-5 w-5 text-amber-600" />
//                       Extension Requested
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-6">
//                     <div className="space-y-4">
//                       <div>
//                         <p className="text-amber-800 font-medium mb-1">
//                           Current Due Date:
//                         </p>
//                         <p className="text-slate-700 font-medium">
//                           {task?.dueDate
//                             ? format(new Date(task.dueDate), "PPP")
//                             : "Not set"}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-amber-800 font-medium mb-1">
//                           Requested Due Date:
//                         </p>
//                         <p className="text-slate-700 font-medium">
//                           {task?.requestedDate
//                             ? format(new Date(task.requestedDate), "PPP")
//                             : "Not set"}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-amber-800 font-medium mb-1">
//                           Reason for Extension:
//                         </p>
//                         <p className="leading-relaxed text-slate-700 p-3 bg-amber-50 rounded-md border border-amber-100">
//                           {task.requestDateExtensionReason}
//                         </p>
//                       </div>

//                       {/* Only show approve/reject buttons to the task creator */}
//                       {createdUser?.email ===
//                         currentUser?.email && (
//                         <div className="flex gap-3 mt-2">
//                           <Button
//                             onClick={handleApproveRequestDateExtension}
//                             className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm"
//                           >
//                             <CheckCircle className="w-4 h-4 mr-2" />
//                             Approve
//                           </Button>
//                           <Button
//                             onClick={handleRejectRequestDateExtension}
//                             variant="outline"
//                             className="flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
//                           >
//                             <AlertCircle className="w-4 h-4 mr-2" />
//                             Reject
//                           </Button>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             )}

//             {/* Remarks Section */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.3 }}
//             >
//               <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
//                 <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4 border-b border-slate-200 px-6 py-4">
//                 <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
//                     <MessageSquare className="h-5 w-5 text-indigo-500" />
//                     Special Note
//                 </CardTitle>
//               </CardHeader>
//                 <CardContent className="p-6">
//                   <p
//                     className={`leading-relaxed ${
//                       task?.remarks ? "text-slate-700" : "text-slate-400 italic"
//                     }`}
//                   >
//                     {task?.remarks || "No special notes for this task."}
//                   </p>
//               </CardContent>
//             </Card>
//             </motion.div>

//             {/* Attachments Section */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//             >
//               <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
//                 <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4 border-b border-slate-200 px-6 py-4">
//                 <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
//                     <Paperclip className="h-5 w-5 text-indigo-500" />
//                   Attachments
//                 </CardTitle>
//                   <CardDescription className="text-slate-500 text-sm mt-1">
//                     Documents and resources for this task
//                   </CardDescription>
//               </CardHeader>
//                 <CardContent className="p-6">
//                   {/* File Upload Section - only shown to assignee when task is not completed and not on hold */}
//                   {assignedUser?.email ===
//                     currentUser?.email &&
//                     !task.completed &&
//                     task.status !== "on_hold" && (
//                       <div className="mb-6">
//                         <form
//                           onSubmit={async (e) => {
//                             e.preventDefault();
//                             const fileInput = e.currentTarget.querySelector(
//                               'input[type="file"]'
//                             ) as HTMLInputElement;
//                             if (!fileInput?.files?.length) {
//                               toast.error(
//                                 "Please select at least one file to upload"
//                               );
//                               return;
//                             }

//                             const formData = new FormData();
//                             for (let i = 0; i < fileInput.files.length; i++) {
//                               formData.append("files", fileInput.files[i]);
//                             }

//                             const toastId = toast.loading("Uploading files...");
//                             try {
//                               const response = await fetch(
//                                 `/api/tasks/${taskId}/files`,
//                                 {
//                                   method: "POST",
//                                   body: formData,
//                                 }
//                               );

//                               if (!response.ok) {
//                                 const errorData = await response.json();
//                                 throw new Error(
//                                   `Upload failed: ${
//                                     errorData.error || response.statusText
//                                   }`
//                                 );
//                               }

//                               const result = await response.json();
//                               toast.success("Files uploaded successfully", {
//                                 id: toastId,
//                               });

//                               // Update the task state with new files
//                               if (result.task) {
//                                 setTask(result.task);
//                                 console.log(
//                                   "Updated task with new files:",
//                                   result.task
//                                 );
//                               } else {
//                                 console.warn(
//                                   "No task returned in response, fetching fresh data"
//                                 );
//                                 // Refresh the data if task state update fails
//                                 fetchTask();
//                               }

//                               // Clear the file input
//                               fileInput.value = "";
//                             } catch (error) {
//                               console.error("Error uploading files:", error);
//                               toast.error("Failed to upload files", {
//                                 id: toastId,
//                               });
//                             }
//                           }}
//                           className="space-y-4"
//                         >
//                           <div className="flex flex-col space-y-2">
//                             <Label
//                               htmlFor="file-upload"
//                               className="text-sm font-medium text-slate-700"
//                             >
//                               Upload New Files
//                             </Label>
//                             <div className="flex items-center gap-2">
//                               <Input
//                                 id="file-upload"
//                                 type="file"
//                                 multiple
//                                 className="flex-1 cursor-pointer border-slate-200 focus-visible:ring-indigo-500"
//                               />
//                               <Button
//                                 type="submit"
//                                 className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
//                               >
//                                 <Paperclip className="mr-2 h-4 w-4" />
//                                 Upload
//                               </Button>
//                             </div>
//                             <p className="text-xs text-slate-500">
//                               Upload documents, images, or other files related
//                               to this task.
//                             </p>
//                           </div>
//                         </form>
//                       </div>
//                     )}

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     {task.files && (task.files as TaskFile[]).length > 0 ? (
//                       (task.files as TaskFile[]).map((file, index) => (
//                     <motion.div
//                       key={index}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.3, delay: index * 0.1 }}
//                           whileHover={{
//                             scale: 1.02,
//                             boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
//                           }}
//                           className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
//                         >
//                           {getFileIcon(getFileType(file.name))}
//                           <div className="flex-1 min-w-0">
//                             <p className="text-sm font-medium text-slate-800 truncate hover:text-indigo-600">
//                               {file.name}
//                             </p>
//                         <p className="text-xs text-slate-500 capitalize">
//                               {getFileType(file.name)} ·{" "}
//                               {file.size ||
//                                 (file.type && file.type.split("/")[1])}
//                         </p>
//                       </div>
//                           <div className="flex gap-1">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() =>
//                                 handleFileDownload(file.path, file.name)
//                               }
//                               title="Download file"
//                               className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
//                             >
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             width="16"
//                             height="16"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           >
//                             <path d="M12 17V3" />
//                             <path d="m6 11 6 6 6-6" />
//                             <path d="M19 21H5" />
//                           </svg>
//                       </Button>

//                             {/* Delete button - only show for task assignee when task is not on hold and not completed */}
//                             {assignedUser?.email ===
//                               currentUser?.email &&
//                               !task.completed &&
//                               task.status !== "on_hold" && (
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={async () => {
//                                     const confirmDelete = window.confirm(
//                                       `Are you sure you want to delete "${file.name}"?`
//                                     );
//                                     if (!confirmDelete) return;

//                                     const toastId = toast.loading(
//                                       `Deleting ${file.name}...`
//                                     );
//                                     try {
//                                       const response = await fetch(
//                                         `/api/tasks/${taskId}/files`,
//                                         {
//                                           method: "DELETE",
//                                           headers: {
//                                             "Content-Type": "application/json",
//                                           },
//                                           body: JSON.stringify({
//                                             fileName: file.name,
//                                           }),
//                                         }
//                                       );

//                                       if (!response.ok) {
//                                         throw new Error(
//                                           `Delete failed: ${response.statusText}`
//                                         );
//                                       }

//                                       const result = await response.json();
//                                       toast.success(`${file.name} deleted`, {
//                                         id: toastId,
//                                       });

//                                       // Update the task state with new files list
//                                       if (task && result.task) {
//                                         setTask(result.task);
//                                       } else {
//                                         // Refresh the data if task state update fails
//                                         fetchTask();
//                                       }
//                                     } catch (error) {
//                                       console.error(
//                                         "Error deleting file:",
//                                         error
//                                       );
//                                       toast.error(
//                                         `Failed to delete ${file.name}`,
//                                         { id: toastId }
//                                       );
//                                     }
//                                   }}
//                                   title="Delete file"
//                                   className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               )}
//                           </div>
//                     </motion.div>
//                       ))
//                     ) : (
//                       <div className="col-span-full flex flex-col items-center justify-center p-10 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50">
//                         <Paperclip className="h-12 w-12 text-slate-300 mb-3" />
//                         <p className="text-slate-600 font-medium mb-1">
//                           No attachments yet
//                         </p>
//                         <p className="text-slate-500 text-sm mb-4">
//                           Upload files to share with the team
//                         </p>
//                         {assignedUser?.email ===
//                           currentUser?.email &&
//                           !task.completed &&
//                           task.status !== "on_hold" && (
//                             <TaskButton
//                               type="edit"
//                               onSubmit={handleSubmit}
//                               task={task}
//                             />
//                           )}
//                       </div>
//                     )}
//                 </div>
//               </CardContent>
//             </Card>
//             </motion.div>
//           </div>

//           <div className="space-y-6">
//             {/* Actions Section - only visible to assignee */}
//             {assignedUser?.email ===
//               currentUser?.email && (
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.5, delay: 0.4 }}
//               >
//                 <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
//                   <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4 border-b border-slate-200 px-6 py-4">
//                 <CardTitle className="text-lg text-slate-800">
//                       Task Actions
//                 </CardTitle>
//                     <CardDescription className="text-slate-500 text-sm mt-1">
//                       Manage task status and delegation
//                     </CardDescription>
//               </CardHeader>
//                   <CardContent className="p-6">
//                     {task.completed ? (
//                 <div className="space-y-4">
//                         <div className="rounded-lg p-4 bg-emerald-50 border border-emerald-200 text-emerald-800">
//                           <div className="flex items-center gap-2 mb-2">
//                             <CheckCircle className="h-5 w-5 text-emerald-600" />
//                             <h3 className="font-medium">Task Completed</h3>
//                     </div>
//                           <p className="text-sm">
//                             This task has been marked as complete. You can mark
//                             it as incomplete if needed.
//                           </p>
//                   </div>

//                         <motion.div
//                           whileHover={{ scale: 1.01 }}
//                           whileTap={{ scale: 0.98 }}
//                           className="overflow-hidden rounded-lg shadow-sm"
//                         >
//                           <Button
//                             onClick={() => {
//                               const newTask: Task = { ...task };
//                               newTask.completed = false;
//                               newTask.status = null;
//                               setTask(newTask);
//                               handleUpdateTask(newTask);
//                             }}
//                             className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium"
//                           >
//                             <Repeat className="w-5 h-5 mr-2" />
//                             Mark as Incomplete
//                           </Button>
//                         </motion.div>
//                     </div>
//                     ) : (
//                       <div className="space-y-4">
//                         {/* On hold / Resume task button */}
//                         <motion.div
//                           whileHover={{ scale: 1.01 }}
//                           whileTap={{ scale: 0.98 }}
//                           className="overflow-hidden rounded-lg shadow-sm"
//                         >
//                           {task.status === "on_hold" ? (
//                             <Button
//                               onClick={() => {
//                                 const newTask: Task = { ...task };
//                                 newTask.completed = false;
//                                 newTask.status = null;
//                                 newTask.onHoldReason = null;
//                                 setTask(newTask);
//                                 handleUpdateTask(newTask);
//                               }}
//                               className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium"
//                             >
//                               <Repeat className="w-5 h-5 mr-2" />
//                               Resume Task
//                             </Button>
//                           ) : (
//                             <Dialog>
//                               <DialogTrigger asChild>
//                                 <Button className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium">
//                                   <PauseCircle className="w-5 h-5 mr-2" />
//                                   Put On Hold
//                                 </Button>
//                               </DialogTrigger>
//                               <DialogContent className="max-w-md">
//                                 <DialogHeader>
//                                   <DialogTitle className="text-xl text-slate-800">
//                                     Put Task On Hold
//                                   </DialogTitle>
//                                   <DialogDescription className="text-slate-500 mt-2">
//                                     Please provide a reason for putting this
//                                     task on hold.
//                                   </DialogDescription>
//                                 </DialogHeader>
//                                 <div className="space-y-4 py-4">
//                                   <Label
//                                     htmlFor="onHoldReason"
//                                     className="text-slate-700"
//                                   >
//                                     Reason
//                                   </Label>
//                                   <Textarea
//                                     id="onHoldReason"
//                                     placeholder="Explain why you're putting this task on hold..."
//                                     className="min-h-[120px] resize-none border-slate-300 focus-visible:ring-indigo-500"
//                                     value={task.onHoldReason || ""}
//                                     onChange={(e) => {
//                                       const newTask = { ...task };
//                                       newTask.onHoldReason = e.target.value;
//                                       setTask(newTask);
//                                     }}
//                                   />
//                                   <Button
//                                     className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white"
//                                     disabled={!task.onHoldReason?.trim()}
//                                     onClick={() => {
//                                       if (!task.onHoldReason?.trim()) {
//                                         toast.error(
//                                           "Please provide a reason for putting the task on hold"
//                                         );
//                                         return;
//                                       }

//                                       const newTask: Task = { ...task };
//                                       newTask.completed = false;
//                                       newTask.status = "on_hold";
//                                       handleUpdateTask(newTask);

//                                       // Close the dialog
//                                       const closeButton =
//                                         document.querySelector(
//                                           '[data-state="open"] button[aria-label="Close"]'
//                                         );
//                                       if (closeButton instanceof HTMLElement) {
//                                         closeButton.click();
//                                       }
//                                     }}
//                                   >
//                                     Confirm
//                                   </Button>
//                     </div>
//                               </DialogContent>
//                             </Dialog>
//                           )}
//                         </motion.div>

//                         {/* Mark as complete button */}
//                         <motion.div
//                           whileHover={{ scale: 1.01 }}
//                           whileTap={{ scale: 0.98 }}
//                           className="overflow-hidden rounded-lg shadow-sm"
//                         >
//                           <Button
//                             onClick={() => {
//                               const newTask: Task = { ...task };
//                               newTask.completed = true;
//                               newTask.status = "completed";
//                               setTask(newTask);
//                               handleUpdateTask(newTask);
//                             }}
//                             className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium"
//                           >
//                             <CheckCircle className="w-5 h-5 mr-2" />
//                             Mark as Complete
//                           </Button>
//                         </motion.div>

//                         {/* Re-delegate task - only available if task is not on hold */}
//                         {task.status !== "on_hold" && (
//                           <motion.div
//                             whileHover={{ scale: 1.01 }}
//                             whileTap={{ scale: 0.98 }}
//                             className="overflow-hidden rounded-lg shadow-sm"
//                           >
//                             <Dialog>
//                               <DialogTrigger asChild>
//                                 <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium">
//                                   <Forward className="w-5 h-5 mr-2" />
//                                   Re-delegate Task
//                                 </Button>
//                               </DialogTrigger>
//                               <DialogContent className="max-w-md">
//                                 <DialogHeader>
//                                   <DialogTitle className="text-xl text-slate-800">
//                                     Re-delegate Task
//                                   </DialogTitle>
//                                   <DialogDescription className="text-slate-500 mt-2">
//                                     Assign this task to another team member
//                                   </DialogDescription>
//                                 </DialogHeader>
//                                 <div className="space-y-4 py-4">
//                                   <Label
//                                     htmlFor="assignedUserId"
//                                     className="text-slate-700"
//                                   >
//                                     Select Team Member
//                                   </Label>
//                                   <Select
//                                     name="assignedUserId"
//                                     value={task.assignedUserId?.toString()}
//                                     onValueChange={(value) => {
//                                       const newTask: Task = {
//                                         ...task,
//                                         assignedUserId: Number(value),
//                                       };
//                                       setTask(newTask);
//                                       handleUpdateTask(newTask);
//                                     }}
//                                   >
//                                     <SelectTrigger className="w-full h-11 bg-white border-slate-300">
//                                       <SelectValue
//                                         placeholder="Select a team member"
//                                         className="text-slate-700"
//                                       />
//                                     </SelectTrigger>
//                                     <SelectContent className="max-h-60">
//                                       {users?.map((user) => (
//                                         <SelectItem
//                                           key={user.id}
//                                           value={user.id.toString()}
//                                           className="cursor-pointer"
//                                         >
//                                           <div className="flex items-center">
//                                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-2">
//                                               {user.name.charAt(0)}
//                     </div>
//                                             {user.name}
//                     </div>
//                                         </SelectItem>
//                                       ))}
//                                     </SelectContent>
//                                   </Select>
//                   </div>
//                               </DialogContent>
//                             </Dialog>
//                           </motion.div>
//                         )}

//                         {/* Request deadline extension button - only shown if task is not on hold and no existing request */}
//                         {task.status !== "on_hold" && (
//                   <Button
//                     variant="outline"
//                             onClick={() => setIsEditing((prev) => !prev)}
//                             disabled={!!task.requestDateExtensionReason}
//                             className={`w-full border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium ${
//                               !!task.requestDateExtensionReason &&
//                               "opacity-50 cursor-not-allowed"
//                             }`}
//                           >
//                             <AlertCircle className="w-5 h-5 mr-2" />
//                             Request Deadline Extension
//                   </Button>
//                         )}
//                 </div>
//                     )}

//                     {/* Extension request form */}
//                     {isEditing &&
//                       !task.requestDateExtensionReason &&
//                       !task.completed &&
//                       task.status !== "on_hold" && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     transition={{ duration: 0.3 }}
//                           className="mt-6 space-y-4 p-5 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-inner"
//                   >
//                           <h3 className="font-medium text-amber-800 flex items-center gap-2 text-base">
//                             <AlertCircle className="h-5 w-5" />
//                       Request Due Date Extension
//                     </h3>
//                           <div className="space-y-4">
//                       <div>
//                               <Label
//                                 htmlFor="newDueDate"
//                                 className="text-amber-800 mb-1.5 block text-sm font-medium"
//                               >
//                           New Due Date
//                         </Label>
//                         <Input
//                           id="newDueDate"
//                           type="date"
//                           value={newDueDate}
//                           onChange={(e) => setNewDueDate(e.target.value)}
//                                 className="border-amber-200 focus-visible:ring-amber-500 bg-white shadow-sm h-10 text-sm w-full"
//                         />
//                       </div>
//                       <div>
//                         <Label
//                           htmlFor="extensionReason"
//                                 className="text-amber-800 mb-1.5 block text-sm font-medium"
//                         >
//                           Reason for Extension
//                         </Label>
//                         <Textarea
//                           id="extensionReason"
//                           value={extensionReason}
//                                 onChange={(e) =>
//                                   setExtensionReason(e.target.value)
//                                 }
//                                 placeholder="Please explain why you need more time to complete this task..."
//                                 className="border-amber-200 focus-visible:ring-amber-500 bg-white shadow-sm min-h-[120px] text-sm w-full"
//                         />
//                       </div>
//                     </div>
//                           <motion.div
//                             whileHover={{ scale: 1.01 }}
//                             whileTap={{ scale: 0.98 }}
//                             className="pt-2"
//                           >
//                     <Button
//                       onClick={handleRequestExtension}
//                               disabled={!newDueDate || !extensionReason}
//                               className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md h-11 font-medium ${
//                                 (!newDueDate || !extensionReason) &&
//                                 "opacity-50 cursor-not-allowed"
//                               }`}
//                             >
//                               <Calendar className="w-5 h-5 mr-2" />
//                               Submit Extension Request
//                     </Button>
//                           </motion.div>
//                   </motion.div>
//                 )}
//               </CardContent>
//             </Card>
//               </motion.div>
//             )}

//             {/* Task Details Section - visible to all users */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.3 }}
//             >
//               <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
//                 <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4 border-b border-slate-200 px-6 py-4">
//                   <CardTitle className="text-lg text-slate-800">
//                     Task Details
//                   </CardTitle>
//                   <CardDescription className="text-slate-500 text-sm mt-1">
//                     Key information about this task
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <div className="space-y-4">
//                     <motion.div
//                       whileHover={{
//                         y: -2,
//                         boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
//                       }}
//                       className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
//                     >
//                       <div className="bg-indigo-100 rounded-full p-2.5 flex items-center justify-center">
//                         <UserIcon className="w-5 h-5 text-indigo-600" />
//                       </div>
//                       <div>
//                         <p className="text-xs font-medium text-indigo-500 mb-0.5">
//                           Created by
//                         </p>
//                         <p className="font-medium text-slate-800">
//                           {createdUser?.name || "Unknown"}
//                         </p>
//                       </div>
//                     </motion.div>

//                     <motion.div
//                       whileHover={{
//                         y: -2,
//                         boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
//                       }}
//                       className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
//                     >
//                       <div className="bg-purple-100 rounded-full p-2.5 flex items-center justify-center">
//                         <UserIcon className="w-5 h-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <p className="text-xs font-medium text-purple-500 mb-0.5">
//                           Assignee
//                         </p>
//                         <p className="font-medium text-slate-800">
//                           {assignedUser?.name || "Unassigned"}
//                         </p>
//                       </div>
//                     </motion.div>

//                     <motion.div
//                       whileHover={{
//                         y: -2,
//                         boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
//                       }}
//                       className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
//                     >
//                       <div
//                         className={`${
//                           isOverdue ? "bg-red-100" : "bg-emerald-100"
//                         } rounded-full p-2.5 flex items-center justify-center`}
//                       >
//                         <Calendar
//                           className={`w-5 h-5 ${
//                             isOverdue ? "text-red-600" : "text-emerald-600"
//                           }`}
//                         />
//                       </div>
//                       <div>
//                         <p
//                           className={`text-xs font-medium ${
//                             isOverdue ? "text-red-500" : "text-emerald-500"
//                           } mb-0.5`}
//                         >
//                           Due Date
//                         </p>
//                         <p
//                           className={`font-medium ${
//                             isOverdue ? "text-red-600" : "text-slate-800"
//                           }`}
//                         >
//                           {task?.dueDate
//                             ? format(new Date(task.dueDate), "PPP")
//                             : "Not set"}
//                           {isOverdue && (
//                             <span className="text-red-500 text-xs ml-2 font-bold bg-red-50 px-1.5 py-0.5 rounded">
//                               OVERDUE
//                             </span>
//                           )}
//                         </p>
//                       </div>
//                     </motion.div>

//                     <motion.div
//                       whileHover={{
//                         y: -2,
//                         boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
//                       }}
//                       className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
//                     >
//                       <div className="bg-amber-100 rounded-full p-2.5 flex items-center justify-center">
//                         <CalendarClock className="w-5 h-5 text-amber-600" />
//                       </div>
//                       <div>
//                         <p className="text-xs font-medium text-amber-500 mb-0.5">
//                           Created
//                         </p>
//                         <p className="font-medium text-slate-800">
//                           {task?.createdAt
//                             ? format(new Date(task.createdAt), "PPP")
//                             : "Unknown"}
//                         </p>
//                       </div>
//                     </motion.div>

//                     <motion.div
//                       whileHover={{
//                         y: -2,
//                         boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
//                       }}
//                       className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
//                     >
//                       <div className="bg-cyan-100 rounded-full p-2.5 flex items-center justify-center">
//                         <Clock className="w-5 h-5 text-cyan-600" />
//                       </div>
//                       <div>
//                         <p className="text-xs font-medium text-cyan-500 mb-0.5">
//                           Last Updated
//                         </p>
//                         <p className="font-medium text-slate-800">
//                           {task?.updatedAt
//                             ? format(new Date(task.updatedAt), "PPP")
//                             : "Unknown"}
//                         </p>
//                       </div>
//                     </motion.div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </div>
//         </div>
//       </motion.div>

//       <DeleteTaskAlert
//         task={showDeleteAlert ? task : null}
//         onConfirm={handleDeleteConfirm}
//         onCancel={() => setShowDeleteAlert(false)}
//       />
//     </div>
//   );
// }

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
  PauseCircle,
  CheckCircle,
  Repeat,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

// Ensure the TaskFile interface is properly defined at the top of the file
interface TaskFile {
  name: string;
  path: string;
  type: string;
  size?: string;
}

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
  const { user: currentUser } = useAuth();
  const params = useParams<{ taskId: string }>();
  const taskId = params?.taskId;
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

  // Function to identify file type from extension
  const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    if (["pdf"].includes(extension)) return "pdf";
    if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(extension))
      return "image";
    if (["doc", "docx", "txt", "md", "rtf"].includes(extension)) return "text";
    if (["xls", "xlsx", "csv"].includes(extension)) return "spreadsheet";
    if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "html",
        "css",
        "java",
        "py",
        "c",
        "cpp",
      ].includes(extension)
    )
      return "code";

    return "unknown";
  };

  // Function to download a file
  const handleFileDownload = async (filePath: string, fileName: string) => {
    try {
      console.log("Attempting to download file:", { filePath, fileName });

      // Show loading toast
      const toastId = toast.loading(`Starting download for ${fileName}...`);

      // Handle file path - original format is typically: /documents/{taskId}/{fileName}
      // For the download API we want to pass the relative path
      if (!filePath) {
        toast.error("Invalid file path", { id: toastId });
        return;
      }

      // Create a direct path to the file in the task's directory
      // Using the download API which accepts path relative to process.cwd()
      // This is more reliable than trying to parse the existing path
      const downloadPath = `documents/${taskId}/${fileName}`;
      console.log("Using download path:", downloadPath);

      // Trigger the download by opening the URL in a new tab
      const downloadUrl = `/api/download?path=${encodeURIComponent(
        downloadPath
      )}`;
      console.log("Download URL:", downloadUrl);

      // Use window.open for direct download
      window.open(downloadUrl, "_blank");

      // Update the toast to success
      toast.success(`Download started for ${fileName}`, { id: toastId });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download file. Please try again."
      );
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(`/api/users`);
      const data = await response.json();

      setUsers(data.users as User[]);
    };

    fetchUsers();
  }, []);

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

  useEffect(() => {
    // Fetch task data using taskId

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
      //   setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      setTask(updatedTask);

      // Fetch updated user data
      if (updatedTask.assignedUserId) {
        await fetchUser(updatedTask.assignedUserId, "assigned");
      }

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
      }

      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      //   setIsLoading(false);
      router.refresh();
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
    console.log("updating for request:", newTask);
    setTask(newTask);

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
    <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl bg-white shadow-xl p-6 border border-slate-100 max-w-7xl mx-auto"
      >
        {/* Header Section with Task Title and Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-200"
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
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1 hover:bg-emerald-200 px-2.5 py-0.5 rounded-full">
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
                className={`px-3 py-0.5 rounded-full ${
                  task?.priorityType === "high"
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                    : task?.priorityType === "medium"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                }`}
              >
                {task?.priorityType.toUpperCase()} PRIORITY
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 leading-tight mb-2">
              {task?.description}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4 text-slate-400" />
                <span>{assignedUser?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  {task?.dueDate
                    ? format(new Date(task.dueDate), "PPP")
                    : "No due date"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>
                  Updated{" "}
                  {task?.updatedAt
                    ? format(new Date(task.updatedAt), "PPP")
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 lg:mt-0 lg:flex-nowrap">
            {/* Edit button - only shown when user is the assignee AND task is not on hold AND not completed */}
            {assignedUser?.email === currentUser?.email &&
              !task.completed &&
              task.status !== "on_hold" && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TaskButton type="edit" onSubmit={handleSubmit} task={task} />
                </motion.div>
              )}
            {/* Delete button - shown to assigned user or creator when not completed */}
            {(assignedUser?.email === currentUser?.email ||
              createdUser?.email === currentUser?.email) &&
              !task.completed && (
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
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* On-hold Reason Section - visible to all users */}
            {task.status === "on_hold" && task.onHoldReason && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="overflow-hidden border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-4 border-b border-amber-200 px-6 py-4">
                    <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                      <PauseCircle className="h-5 w-5 text-amber-600" />
                      Task On Hold
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-amber-800 font-medium mb-2">Reason:</p>
                    <p className="leading-relaxed text-slate-700 p-3 bg-amber-50 rounded-md border border-amber-100">
                      {task.onHoldReason}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Extension Request Section - visible to all users */}
            {task.requestDateExtensionReason && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <Card className="overflow-hidden border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-4 border-b border-amber-200 px-6 py-4">
                    <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      Extension Requested
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-amber-800 font-medium mb-1">
                          Current Due Date:
                        </p>
                        <p className="text-slate-700 font-medium">
                          {task?.dueDate
                            ? format(new Date(task.dueDate), "PPP")
                            : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-amber-800 font-medium mb-1">
                          Requested Due Date:
                        </p>
                        <p className="text-slate-700 font-medium">
                          {task?.requestedDate
                            ? format(new Date(task.requestedDate), "PPP")
                            : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-amber-800 font-medium mb-1">
                          Reason for Extension:
                        </p>
                        <p className="leading-relaxed text-slate-700 p-3 bg-amber-50 rounded-md border border-amber-100">
                          {task.requestDateExtensionReason}
                        </p>
                      </div>

                      {/* Only show approve/reject buttons to the task creator */}
                      {createdUser?.email === currentUser?.email && (
                        <div className="flex gap-3 mt-2">
                          <Button
                            onClick={handleApproveRequestDateExtension}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={handleRejectRequestDateExtension}
                            variant="outline"
                            className="flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Remarks Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                    Special Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p
                    className={`leading-relaxed ${
                      task?.remarks ? "text-slate-700" : "text-slate-400 italic"
                    }`}
                  >
                    {task?.remarks || "No special notes for this task."}
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
              <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-indigo-500" />
                    Attachments
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-sm mt-1">
                    Documents and resources for this task
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* File Upload Section - only shown to assignee when task is not completed and not on hold */}
                  {assignedUser?.email === currentUser?.email &&
                    !task.completed &&
                    task.status !== "on_hold" && (
                      <div className="mb-6">
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const fileInput = e.currentTarget.querySelector(
                              'input[type="file"]'
                            ) as HTMLInputElement;
                            if (!fileInput?.files?.length) {
                              toast.error(
                                "Please select at least one file to upload"
                              );
                              return;
                            }

                            const formData = new FormData();
                            for (let i = 0; i < fileInput.files.length; i++) {
                              formData.append("files", fileInput.files[i]);
                            }

                            const toastId = toast.loading("Uploading files...");
                            try {
                              const response = await fetch(
                                `/api/tasks/${taskId}/files`,
                                {
                                  method: "POST",
                                  body: formData,
                                }
                              );

                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(
                                  `Upload failed: ${
                                    errorData.error || response.statusText
                                  }`
                                );
                              }

                              const result = await response.json();
                              toast.success("Files uploaded successfully", {
                                id: toastId,
                              });

                              // Update the task state with new files
                              if (result.task) {
                                setTask(result.task);
                                console.log(
                                  "Updated task with new files:",
                                  result.task
                                );
                              } else {
                                console.warn(
                                  "No task returned in response, fetching fresh data"
                                );
                                // Refresh the data if task state update fails
                                fetchTask();
                              }

                              // Clear the file input
                              fileInput.value = "";
                            } catch (error) {
                              console.error("Error uploading files:", error);
                              toast.error("Failed to upload files", {
                                id: toastId,
                              });
                            }
                          }}
                          className="space-y-4"
                        >
                          <div className="flex flex-col space-y-2">
                            <Label
                              htmlFor="file-upload"
                              className="text-sm font-medium text-slate-700"
                            >
                              Upload New Files
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="file-upload"
                                type="file"
                                multiple
                                className="flex-1 cursor-pointer border-slate-200 focus-visible:ring-indigo-500"
                              />
                              <Button
                                type="submit"
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                              >
                                <Paperclip className="mr-2 h-4 w-4" />
                                Upload
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                              Upload documents, images, or other files related
                              to this task.
                            </p>
                          </div>
                        </form>
                      </div>
                    )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {task.files && (task.files as TaskFile[]).length > 0 ? (
                      (task.files as TaskFile[]).map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          }}
                          className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
                        >
                          {getFileIcon(getFileType(file.name))}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate hover:text-indigo-600">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">
                              {getFileType(file.name)} ·{" "}
                              {file.size ||
                                (file.type && file.type.split("/")[1])}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleFileDownload(file.path, file.name)
                              }
                              title="Download file"
                              className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
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

                            {/* Delete button - only show for task assignee when task is not on hold and not completed */}
                            {assignedUser?.email === currentUser?.email &&
                              !task.completed &&
                              task.status !== "on_hold" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    const confirmDelete = window.confirm(
                                      `Are you sure you want to delete "${file.name}"?`
                                    );
                                    if (!confirmDelete) return;

                                    const toastId = toast.loading(
                                      `Deleting ${file.name}...`
                                    );
                                    try {
                                      const response = await fetch(
                                        `/api/tasks/${taskId}/files`,
                                        {
                                          method: "DELETE",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            fileName: file.name,
                                          }),
                                        }
                                      );

                                      if (!response.ok) {
                                        throw new Error(
                                          `Delete failed: ${response.statusText}`
                                        );
                                      }

                                      const result = await response.json();
                                      toast.success(`${file.name} deleted`, {
                                        id: toastId,
                                      });

                                      // Update the task state with new files list
                                      if (task && result.task) {
                                        setTask(result.task);
                                      } else {
                                        // Refresh the data if task state update fails
                                        fetchTask();
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Error deleting file:",
                                        error
                                      );
                                      toast.error(
                                        `Failed to delete ${file.name}`,
                                        { id: toastId }
                                      );
                                    }
                                  }}
                                  title="Delete file"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center p-10 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50">
                        <Paperclip className="h-12 w-12 text-slate-300 mb-3" />
                        <p className="text-slate-600 font-medium mb-1">
                          No attachments yet
                        </p>
                        <p className="text-slate-500 text-sm mb-4">
                          Upload files to share with the team
                        </p>
                        {assignedUser?.email === currentUser?.email &&
                          !task.completed &&
                          task.status !== "on_hold" && (
                            <TaskButton
                              type="edit"
                              onSubmit={handleSubmit}
                              task={task}
                            />
                          )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Actions Section - only visible to assignee */}
            {assignedUser?.email === currentUser?.email && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4 border-b border-slate-200 px-6 py-4">
                    <CardTitle className="text-lg text-slate-800">
                      Task Actions
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm mt-1">
                      Manage task status and delegation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {task.completed ? (
                      <div className="space-y-4">
                        <div className="rounded-lg p-4 bg-emerald-50 border border-emerald-200 text-emerald-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-medium">Task Completed</h3>
                          </div>
                          <p className="text-sm">
                            This task has been marked as complete. You can mark
                            it as incomplete if needed.
                          </p>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="overflow-hidden rounded-lg shadow-sm"
                        >
                          <Button
                            onClick={() => {
                              const newTask: Task = { ...task };
                              newTask.completed = false;
                              newTask.status = null;
                              setTask(newTask);
                              handleUpdateTask(newTask);
                            }}
                            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium"
                          >
                            <Repeat className="w-5 h-5 mr-2" />
                            Mark as Incomplete
                          </Button>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* On hold / Resume task button */}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="overflow-hidden rounded-lg shadow-sm"
                        >
                          {task.status === "on_hold" ? (
                            <Button
                              onClick={() => {
                                const newTask: Task = { ...task };
                                newTask.completed = false;
                                newTask.status = null;
                                newTask.onHoldReason = null;
                                setTask(newTask);
                                handleUpdateTask(newTask);
                              }}
                              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium"
                            >
                              <Repeat className="w-5 h-5 mr-2" />
                              Resume Task
                            </Button>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium">
                                  <PauseCircle className="w-5 h-5 mr-2" />
                                  Put On Hold
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-xl text-slate-800">
                                    Put Task On Hold
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-500 mt-2">
                                    Please provide a reason for putting this
                                    task on hold.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <Label
                                    htmlFor="onHoldReason"
                                    className="text-slate-700"
                                  >
                                    Reason
                                  </Label>
                                  <Textarea
                                    id="onHoldReason"
                                    placeholder="Explain why you're putting this task on hold..."
                                    className="min-h-[120px] resize-none border-slate-300 focus-visible:ring-indigo-500"
                                    value={task.onHoldReason || ""}
                                    onChange={(e) => {
                                      const newTask = { ...task };
                                      newTask.onHoldReason = e.target.value;
                                      setTask(newTask);
                                    }}
                                  />
                                  <Button
                                    className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white"
                                    disabled={!task.onHoldReason?.trim()}
                                    onClick={() => {
                                      if (!task.onHoldReason?.trim()) {
                                        toast.error(
                                          "Please provide a reason for putting the task on hold"
                                        );
                                        return;
                                      }

                                      const newTask: Task = { ...task };
                                      newTask.completed = false;
                                      newTask.status = "on_hold";
                                      handleUpdateTask(newTask);

                                      // Close the dialog
                                      const closeButton =
                                        document.querySelector(
                                          '[data-state="open"] button[aria-label="Close"]'
                                        );
                                      if (closeButton instanceof HTMLElement) {
                                        closeButton.click();
                                      }
                                    }}
                                  >
                                    Confirm
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </motion.div>

                        {/* Mark as complete button */}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="overflow-hidden rounded-lg shadow-sm"
                        >
                          <Button
                            onClick={() => {
                              const newTask: Task = { ...task };
                              newTask.completed = true;
                              newTask.status = "completed";
                              setTask(newTask);
                              handleUpdateTask(newTask);
                            }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Mark as Complete
                          </Button>
                        </motion.div>

                        {/* Re-delegate task - only available if task is not on hold */}
                        {task.status !== "on_hold" && (
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="overflow-hidden rounded-lg shadow-sm"
                          >
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium">
                                  <Forward className="w-5 h-5 mr-2" />
                                  Re-delegate Task
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-xl text-slate-800">
                                    Re-delegate Task
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-500 mt-2">
                                    Assign this task to another team member
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <Label
                                    htmlFor="assignedUserId"
                                    className="text-slate-700"
                                  >
                                    Select Team Member
                                  </Label>
                                  <Select
                                    name="assignedUserId"
                                    value={task.assignedUserId?.toString()}
                                    onValueChange={(value) => {
                                      const newTask: Task = {
                                        ...task,
                                        assignedUserId: Number(value),
                                      };
                                      setTask(newTask);
                                      handleUpdateTask(newTask);
                                    }}
                                  >
                                    <SelectTrigger className="w-full h-11 bg-white border-slate-300">
                                      <SelectValue
                                        placeholder="Select a team member"
                                        className="text-slate-700"
                                      />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                      {users?.map((user) => (
                                        <SelectItem
                                          key={user.id}
                                          value={user.id.toString()}
                                          className="cursor-pointer"
                                        >
                                          <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-2">
                                              {user.name.charAt(0)}
                                            </div>
                                            {user.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </motion.div>
                        )}

                        {/* Request deadline extension button - only shown if task is not on hold and no existing request */}
                        {task.status !== "on_hold" && (
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing((prev) => !prev)}
                            disabled={!!task.requestDateExtensionReason}
                            className={`w-full border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-md flex items-center justify-center h-12 rounded-md text-base font-medium ${
                              !!task.requestDateExtensionReason &&
                              "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Request Deadline Extension
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Extension request form */}
                    {isEditing &&
                      !task.requestDateExtensionReason &&
                      !task.completed &&
                      task.status !== "on_hold" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 space-y-4 p-5 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-inner"
                        >
                          <h3 className="font-medium text-amber-800 flex items-center gap-2 text-base">
                            <AlertCircle className="h-5 w-5" />
                            Request Due Date Extension
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <Label
                                htmlFor="newDueDate"
                                className="text-amber-800 mb-1.5 block text-sm font-medium"
                              >
                                New Due Date
                              </Label>
                              <Input
                                id="newDueDate"
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                className="border-amber-200 focus-visible:ring-amber-500 bg-white shadow-sm h-10 text-sm w-full"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="extensionReason"
                                className="text-amber-800 mb-1.5 block text-sm font-medium"
                              >
                                Reason for Extension
                              </Label>
                              <Textarea
                                id="extensionReason"
                                value={extensionReason}
                                onChange={(e) =>
                                  setExtensionReason(e.target.value)
                                }
                                placeholder="Please explain why you need more time to complete this task..."
                                className="border-amber-200 focus-visible:ring-amber-500 bg-white shadow-sm min-h-[120px] text-sm w-full"
                              />
                            </div>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="pt-2"
                          >
                            <Button
                              onClick={handleRequestExtension}
                              disabled={!newDueDate || !extensionReason}
                              className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md h-11 font-medium ${
                                (!newDueDate || !extensionReason) &&
                                "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <Calendar className="w-5 h-5 mr-2" />
                              Submit Extension Request
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Task Details Section - visible to all users */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4 border-b border-slate-200 px-6 py-4">
                  <CardTitle className="text-lg text-slate-800">
                    Task Details
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-sm mt-1">
                    Key information about this task
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
                    >
                      <div className="bg-indigo-100 rounded-full p-2.5 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-500 mb-0.5">
                          Created by
                        </p>
                        <p className="font-medium text-slate-800">
                          {createdUser?.name || "Unknown"}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
                    >
                      <div className="bg-purple-100 rounded-full p-2.5 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-purple-500 mb-0.5">
                          Assignee
                        </p>
                        <p className="font-medium text-slate-800">
                          {assignedUser?.name || "Unassigned"}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
                    >
                      <div
                        className={`${
                          isOverdue ? "bg-red-100" : "bg-emerald-100"
                        } rounded-full p-2.5 flex items-center justify-center`}
                      >
                        <Calendar
                          className={`w-5 h-5 ${
                            isOverdue ? "text-red-600" : "text-emerald-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            isOverdue ? "text-red-500" : "text-emerald-500"
                          } mb-0.5`}
                        >
                          Due Date
                        </p>
                        <p
                          className={`font-medium ${
                            isOverdue ? "text-red-600" : "text-slate-800"
                          }`}
                        >
                          {task?.dueDate
                            ? format(new Date(task.dueDate), "PPP")
                            : "Not set"}
                          {isOverdue && (
                            <span className="text-red-500 text-xs ml-2 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
                    >
                      <div className="bg-amber-100 rounded-full p-2.5 flex items-center justify-center">
                        <CalendarClock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-amber-500 mb-0.5">
                          Created
                        </p>
                        <p className="font-medium text-slate-800">
                          {task?.createdAt
                            ? format(new Date(task.createdAt), "PPP")
                            : "Unknown"}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
                      }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
                    >
                      <div className="bg-cyan-100 rounded-full p-2.5 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-cyan-500 mb-0.5">
                          Last Updated
                        </p>
                        <p className="font-medium text-slate-800">
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
