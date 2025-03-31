import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  initializeSocket,
  registerUser,
  listenForNotifications,
  removeNotificationListener,
  type TaskNotification,
} from "@/lib/socketio";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  Clock,
  CalendarCheck,
} from "lucide-react";

export function NotificationToaster() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);

  useEffect(() => {
    // Initialize socket connection when user data is loaded
    if (!isLoaded || !user) return;

    // Connect to the socket server and register user
    const socket = initializeSocket();
    registerUser(parseInt(user.id));

    // Listen for notifications
    listenForNotifications((notification: TaskNotification) => {
      // Add the notification to state
      setNotifications((prev) => [notification, ...prev]);

      // Show toast notification with icon based on type
      showNotificationToast(notification);
    });

    // Cleanup on unmount
    return () => {
      removeNotificationListener();
    };
  }, [isLoaded, user]);

  // Custom toast notification with appropriate icon
  const showNotificationToast = (notification: TaskNotification) => {
    const { type, message, task } = notification;

    // Get appropriate icon based on notification type
    let Icon = Bell;
    switch (type) {
      case "task_completed":
        Icon = CheckCircle;
        break;
      case "task_on_hold":
        Icon = PauseCircle;
        break;
      case "extension_requested":
      case "extension_approved":
      case "extension_rejected":
        Icon = Clock;
        break;
      case "task_created":
        Icon = CalendarCheck;
        break;
      default:
        Icon = Bell;
    }

    // Display toast notification
    toast(
      <div className="flex items-start">
        <div className="mr-3">
          <Icon className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h4 className="font-medium text-sm">{getNotificationTitle(type)}</h4>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>,
      {
        duration: 5000,
        action: {
          label: "View Task",
          onClick: () => router.push(`/dashboard/${task.id}`),
        },
      }
    );
  };

  // Helper function to get notification title
  const getNotificationTitle = (type: TaskNotification["type"]) => {
    switch (type) {
      case "task_created":
        return "New Task Created";
      case "task_completed":
        return "Task Completed";
      case "task_on_hold":
        return "Task On Hold";
      case "extension_requested":
        return "Extension Requested";
      case "extension_approved":
        return "Extension Approved";
      case "extension_rejected":
        return "Extension Rejected";
      default:
        return "Task Updated";
    }
  };

  // We don't render anything - this component just handles notifications
  return null;
}
