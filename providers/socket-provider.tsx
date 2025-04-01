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
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  markAllAsRead: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        // First, ensure the socket server is running
        await fetch("/api/socketio");

        // Initialize client
        const socketClient = io({
          path: "/api/socketio",
          addTrailingSlash: false,
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

        socketClient.on("disconnect", () => {
          console.log("Socket disconnected");
          setIsConnected(false);
        });

        socketClient.on("notification", (notification: TaskNotification) => {
          console.log("Received notification:", notification);
          setNotifications((prev) => [notification, ...prev]);
        });

        setSocket(socketClient);

        // Cleanup function
        return () => {
          socketClient.disconnect();
        };
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    };

    if (user?.id) {
      initSocket();
    }

    return () => {
      if (socket) {
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

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, notifications, markAllAsRead }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
