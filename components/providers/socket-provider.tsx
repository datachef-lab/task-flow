"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import { TaskNotification } from "@/lib/socket";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: TaskNotification[];
  markAllAsRead: () => void;
  refreshTasks: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  markAllAsRead: () => {},
  refreshTasks: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        // First, ensure the socket server is running
        await fetch("/api/socketio");
        console.log("Socket server initialized, connecting client...");

        // Initialize client with the correct path
        const socketClient = io({
          path: "/api/socketio",
          transports: ["polling", "websocket"],
          autoConnect: true,
        });

        socketClient.on("connect", () => {
          console.log("Socket connected:", socketClient.id);
          setIsConnected(true);

          // Join user's room when connected
          if (user?.id) {
            socketClient.emit("join", user.id.toString());
            console.log(`Joined room for user ${user.id}`);
          }
        });

        socketClient.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
          setIsConnected(false);
        });

        socketClient.on("disconnect", () => {
          console.log("Socket disconnected");
          setIsConnected(false);
        });

        socketClient.on("notification", (notification: TaskNotification) => {
          console.log("Received notification:", notification);
          setNotifications((prev) => [notification, ...prev]);

          // Set refresh flag when a task-related notification is received
          if (notification.type.includes("task_")) {
            setNeedsRefresh(true);
          }
        });

        socketClient.on("task_updated", () => {
          console.log("Task updated event received");
          setNeedsRefresh(true);
        });

        socketClient.on("task_created", () => {
          console.log("Task created event received");
          setNeedsRefresh(true);
        });

        socketClient.on("task_deleted", () => {
          console.log("Task deleted event received");
          setNeedsRefresh(true);
        });

        setSocket(socketClient);

        // Cleanup function
        return () => {
          console.log("Cleaning up socket connection");
          socketClient.disconnect();
        };
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    };

    if (user?.id) {
      console.log("User logged in, initializing socket");
      initSocket();
    }

    return () => {
      if (socket) {
        console.log("Component unmounting, disconnecting socket");
        socket.disconnect();
      }
    };
  }, [user?.id]);

  // Ensure user joins the room when they log in or socket reconnects
  useEffect(() => {
    if (socket && isConnected && user?.id) {
      socket.emit("join", user.id.toString());
      console.log(`Joined room for user ${user.id}`);
    }
  }, [socket, isConnected, user?.id]);

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const refreshTasks = () => {
    setNeedsRefresh(false);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        markAllAsRead,
        refreshTasks,
      }}
    >
      {needsRefresh && (
        <div
          className="fixed top-4 right-4 z-50 bg-blue-100 text-blue-800 p-3 rounded-md shadow-md flex items-center space-x-2 cursor-pointer"
          onClick={refreshTasks}
        >
          <span>New updates available</span>
          <button className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600">
            Refresh
          </button>
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
