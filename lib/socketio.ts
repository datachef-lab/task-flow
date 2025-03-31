// lib/socketio.ts
import type { Task } from '@/db/schema';
import { io, Socket } from 'socket.io-client';

// Define notification types
export type NotificationType =
    | 'task_created'
    | 'task_completed'
    | 'task_on_hold'
    | 'extension_requested'
    | 'extension_approved'
    | 'extension_rejected';

export interface TaskNotification {
    type: NotificationType;
    task: Task;
    message: string;
    timestamp: Date;
}

// Singleton pattern for socket instance
let socket: Socket | null = null;

// Initialize the socket connection
export const initializeSocket = () => {
    if (!socket) {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
        socket = io(socketUrl);

        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    return socket;
};

// Get the socket instance
export const getSocket = () => {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
};

// Register a user with the socket
export const registerUser = (userId: number) => {
    const socket = getSocket();
    if (socket) {
        socket.emit('user_login', userId);
    }
};

// Listen for task notifications
export const listenForNotifications = (callback: (notification: TaskNotification) => void) => {
    const socket = getSocket();
    if (socket) {
        socket.on('task_notification', callback);
    }
};

// Remove notification listener
export const removeNotificationListener = () => {
    const socket = getSocket();
    if (socket) {
        socket.off('task_notification');
    }
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Function to emit task notifications to all connected users
export function emitTaskNotification(type: NotificationType, task: Task) {
    // Access the globally defined io instance
    const io = (global as any).io;

    if (!io) {
        console.warn('Socket.io is not initialized');
        return;
    }

    let message = '';

    // Create appropriate message based on notification type
    switch (type) {
        case 'task_created':
            message = `New task created: ${task.description}`;
            break;
        case 'task_completed':
            message = `Task completed: ${task.description}`;
            break;
        case 'task_on_hold':
            message = `Task put on hold: ${task.description}`;
            break;
        case 'extension_requested':
            message = `Extension requested for task: ${task.description}`;
            break;
        case 'extension_approved':
            message = `Extension approved for task: ${task.description}`;
            break;
        case 'extension_rejected':
            message = `Extension rejected for task: ${task.description}`;
            break;
        default:
            message = `Task updated: ${task.description}`;
    }

    // Create notification object
    const notification: TaskNotification = {
        type,
        task,
        message,
        timestamp: new Date(),
    };

    // Broadcast to all connected clients
    io.emit('task_notification', notification);

    console.log(`Emitted ${type} notification for task ID: ${task.id}`);
} 