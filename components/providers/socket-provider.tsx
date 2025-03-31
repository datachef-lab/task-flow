"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import { TaskNotification } from "@/lib/socket";

interface SocketContextType {
  socket: Socket | null;
  notifications: TaskNotification[];
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  clearNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const socketInstance = io({
      path: "/api/socketio",
    });

    // Join user's room
    socketInstance.emit("join", user.id.toString());

    // Listen for notifications
    socketInstance.on("notification", (notification: TaskNotification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{ socket, notifications, clearNotifications }}
    >
      {children}
    </SocketContext.Provider>
  );
}
