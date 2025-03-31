import { NextRequest, NextResponse } from 'next/server';
import { getSocketIO } from '../../socket/route';
import { getServerSession } from '../../socket/auth';

export interface TaskNotification {
    type: 'task_assigned' | 'task_completed' | 'task_updated' | 'task_reminder';
    task: {
        id: number;
        title: string;
        description?: string;
    };
    message: string;
    userId?: number;
}

export async function POST(req: NextRequest) {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the Socket.io server instance
    const io = getSocketIO();
    if (!io) {
        return NextResponse.json({ error: 'Socket.io server not initialized' }, { status: 500 });
    }

    try {
        // Get the notification data from the request
        const notification: TaskNotification = await req.json();

        // Emit the notification to all connected clients
        io.emit('task_notification', notification);

        console.log(`Emitted ${notification.type} notification for task ID: ${notification.task.id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error emitting notification:', error);
        return NextResponse.json({ error: 'Failed to emit notification' }, { status: 500 });
    }
} 