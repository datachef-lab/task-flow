"use client";

import React, { useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { notifications, markAllAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && notifications.length > 0) {
      markAllAsRead();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <BellIcon className="h-5 w-5 text-slate-600" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-2 -right-2 flex items-center justify-center h-4 min-w-4 p-0 bg-red-500 text-white text-xs">
              {notifications.length}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="text-center">
          {notifications.length > 0 ? "Notifications" : "No new notifications"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification, index) => (
          <DropdownMenuItem
            key={index}
            className="cursor-pointer flex flex-col items-start p-3"
          >
            <div className="font-medium">{notification.message}</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(notification.timestamp), {
                addSuffix: true,
              })}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
