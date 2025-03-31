import { NextApiRequest, NextApiResponse } from 'next';
import { getSocketServer } from '@/lib/socket-server';
import type { TaskNotification } from '@/lib/socketio';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get the notification data from the request
    const notification: TaskNotification = req.body;

    // Get the Socket.io server instance
    const io = getSocketServer(res as any);

    if (!io) {
        return res.status(500).json({ error: 'Socket.io server not initialized' });
    }

    // Emit the notification to all connected clients
    io.emit('task_notification', notification);

    console.log(`Emitted ${notification.type} notification for task ID: ${notification.task.id}`);

    return res.status(200).json({ success: true });
} 