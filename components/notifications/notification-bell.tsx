"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/components/providers/socket-provider";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, clearNotifications } = useSocket();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return "📝";
      case "task_assigned":
        return "👤";
      case "task_updated":
        return "✏️";
      case "task_completed":
        return "✅";
      case "task_on_hold":
        return "⏸️";
      case "task_extension_requested":
        return "⏰";
      case "task_extension_approved":
        return "👍";
      case "task_extension_rejected":
        return "👎";
      default:
        return "📢";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification, index) => (
              <DropdownMenuItem
                key={index}
                className="flex items-start gap-2 p-3 cursor-pointer"
              >
                <span className="text-xl">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
