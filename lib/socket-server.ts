import { Server } from 'socket.io';
import { TaskNotificationType } from './socket';

// Define globals
let io: Server | null = null;

export function getSocketIO() {
    return io;
}

export function createSocketIOServer() {
    if (io) return io;

    console.log('Creating new Socket.IO server instance');

    io = new Server({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        path: '/api/socketio',
        addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join', (userId: string) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined room`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

export interface TaskNotification {
    type: TaskNotificationType;
    taskId: number;
    taskTitle: string;
    userId: number;
    userName: string;
    timestamp: Date;
    message: string;
}

export function emitTaskNotification(
    userId: number,
    notification: TaskNotification
) {
    if (!io) {
        console.warn('Socket.IO not initialized, cannot emit notification');
        return;
    }

    console.log(`Emitting notification to user:${userId}`, notification);

    // Emit to the specific user's room
    io.to(`user:${userId}`).emit('notification', notification);

    // Also emit specific event type for real-time updates
    io.to(`user:${userId}`).emit(notification.type, notification);
}

// Helper to broadcast task changes to all connected users
export function broadcastTaskUpdate(taskId: number, eventType: string) {
    if (!io) {
        console.warn('Socket.IO not initialized, cannot broadcast task update');
        return;
    }

    console.log(`Broadcasting ${eventType} event for task ${taskId} to all clients`);

    // Emit to everyone including the sender
    io.emit(eventType, { taskId, timestamp: new Date() });
} 