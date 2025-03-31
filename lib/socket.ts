import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";
import { Socket as NetSocket } from "net";

export type NextApiResponseServerIO = NextApiResponse & {
    socket: NetSocket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};

export const initSocket = (server: NetServer) => {
    const io = new SocketIOServer(server, {
        path: "/api/socketio",
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // Join user's personal room
        socket.on("join", (userId: string) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

// Event types for task notifications
export type TaskNotificationType =
    | "task_created"
    | "task_assigned"
    | "task_updated"
    | "task_completed"
    | "task_on_hold"
    | "task_extension_requested"
    | "task_extension_approved"
    | "task_extension_rejected";

export interface TaskNotification {
    type: TaskNotificationType;
    taskId: number;
    taskTitle: string;
    userId: number;
    userName: string;
    timestamp: Date;
    message: string;
}

// Helper function to emit notifications
export const emitNotification = (
    io: SocketIOServer,
    userId: number,
    notification: TaskNotification
) => {
    io.to(`user:${userId}`).emit("notification", notification);
}; 