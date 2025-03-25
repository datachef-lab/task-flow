"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Task } from "@/db/schema";
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

// Dummy data
const dummyTask = {
  id: 1,
  abbreviation: "TASK-001",
  description:
    "Implement user authentication system with JWT tokens and refresh tokens",
  createdBy: "John Doe",
  assignee: "Jane Smith",
  dueDate: "2024-04-15",
  createdAt: new Date("2024-03-20"),
  updatedAt: new Date("2024-03-24"),
  remarks:
    "Please ensure to follow security best practices and include rate limiting",
  priorityType: "high" as const,
  completed: false,
  attachments: [
    { name: "design-doc.pdf", url: "#", type: "pdf" },
    { name: "api-spec.md", url: "#", type: "markdown" },
    { name: "wireframe.png", url: "#", type: "image" },
    { name: "data-model.xlsx", url: "#", type: "spreadsheet" },
    { name: "sample-code.js", url: "#", type: "code" },
  ],
  assignedUserId: 1,
  createdUserId: 1,
};

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
  const { abbreviation } = useParams<{ abbreviation: string }>();
  const router = useRouter();
  const [task, setTask] = useState(dummyTask);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [extensionReason, setExtensionReason] = useState("");

  if (!task) return null;

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = () => {
    toast.success("Task deleted successfully");
    router.push("/dashboard");
  };

  const handleRequestExtension = () => {
    if (!newDueDate || !extensionReason) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Extension request submitted successfully");
  };

  const dueDateObj = new Date(task.dueDate);
  const isOverdue = dueDateObj < new Date() && !task.completed;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 bg-gradient-to-b from-white to-slate-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl bg-white shadow-md p-6 border border-slate-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="text-xs font-bold bg-slate-50 border-slate-200"
              >
                {task.abbreviation}
              </Badge>
              {task.completed ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </Badge>
              ) : isOverdue ? (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
                >
                  <Clock4 className="h-3 w-3" /> Overdue
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                >
                  <Clock4 className="h-3 w-3" /> In Progress
                </Badge>
              )}
              <Badge
                className={`text-white ${
                  task.priorityType === "high" ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                {task.priorityType} priority
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {task.description}
            </h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-2">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                  Remarks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 p-5">
                <p className="text-slate-700">{task.remarks}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-2">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-slate-500" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {task.attachments.map((attachment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      {getFileIcon(attachment.type)}
                      <div className="flex-1">
                        <a
                          href={attachment.url}
                          className="text-sm font-medium text-slate-700 hover:text-blue-600 hover:underline"
                        >
                          {attachment.name}
                        </a>
                        <p className="text-xs text-slate-500 capitalize">
                          {attachment.type}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <a href={attachment.url} download>
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
                            className="text-slate-600"
                          >
                            <path d="M12 17V3" />
                            <path d="m6 11 6 6 6-6" />
                            <path d="M19 21H5" />
                          </svg>
                        </a>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-4 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-2">
                <CardTitle className="text-lg text-slate-800">
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <div className="bg-blue-100 rounded-full p-2 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Created by</p>
                      <p className="font-medium text-slate-800">
                        {task.createdBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <div className="bg-purple-100 rounded-full p-2 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Assignee</p>
                      <p className="font-medium text-slate-800">
                        {task.assignee}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
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
                      <p className="text-xs text-slate-500">Due Date</p>
                      <p
                        className={`font-medium ${
                          isOverdue ? "text-red-600" : "text-slate-800"
                        }`}
                      >
                        {format(new Date(task.dueDate), "PPP")}
                        {isOverdue && (
                          <span className="text-red-500 text-xs ml-2">
                            (Overdue)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <div className="bg-amber-100 rounded-full p-2 flex items-center justify-center">
                      <CalendarClock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Created</p>
                      <p className="font-medium text-slate-800">
                        {format(task.createdAt, "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <div className="bg-cyan-100 rounded-full p-2 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Last Updated</p>
                      <p className="font-medium text-slate-800">
                        {format(task.updatedAt, "PPP")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-2">
                <CardTitle className="text-lg text-slate-800">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Button className={`w-full ${getPriorityColor("normal")}`}>
                    <Forward className="w-4 h-4 mr-2" />
                    Forward Task
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Request Extension
                  </Button>
                </div>

                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-4 p-4 rounded-lg border border-amber-200 bg-amber-50"
                  >
                    <h3 className="font-medium text-amber-800">
                      Request Due Date Extension
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="newDueDate" className="text-amber-800">
                          New Due Date
                        </Label>
                        <Input
                          id="newDueDate"
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="border-amber-200 focus-visible:ring-amber-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="extensionReason"
                          className="text-amber-800"
                        >
                          Reason for Extension
                        </Label>
                        <Textarea
                          id="extensionReason"
                          value={extensionReason}
                          onChange={(e) => setExtensionReason(e.target.value)}
                          placeholder="Please explain why you need an extension..."
                          className="border-amber-200 focus-visible:ring-amber-500"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleRequestExtension}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      Submit Request
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
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
