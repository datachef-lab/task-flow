// lib/socket-server.ts
import type { NextApiResponse } from 'next';
import type { Server as SocketIOServer } from 'socket.io';
import type { Task } from '@/db/schema';
import type { NotificationType, TaskNotification } from './socketio';

// Function to get the Socket.io server instance from a Next.js API response
export const getSocketServer = (res: NextApiResponse & { socket: { server: { io?: SocketIOServer } } }): SocketIOServer | null => {
    if (!res.socket.server.io) {
        console.warn('Socket.io server not initialized. Initialize it by calling /api/socket first.');
        return null;
    }
    return res.socket.server.io;
};

// Function to emit task notifications from server-side
export const emitTaskNotification = async (
    type: NotificationType,
    task: Task
): Promise<void> => {
    try {
        // Make a request to our socket API to ensure it's initialized
        const socketRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket`);
        if (!socketRes.ok) {
            console.error('Failed to initialize socket connection');
            return;
        }

        // Create the message based on notification type
        let message = '';
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

        // Now, make a request to a special notification API that will emit the event
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/emit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notification),
        });

        console.log(`Server emitted ${type} notification for task ID: ${task.id}`);
    } catch (error) {
        console.error('Error emitting task notification:', error);
    }
}; 