// app/api/tasks/[id]/toggle/route.ts
import { NextResponse } from 'next/server';
import { getTaskById, updateTask } from '@/lib/services/task-service';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const task = await getTaskById(parseInt(params.id));
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const updatedTask = await updateTask(parseInt(params.id), {
            ...task,
            completed: !task.completed
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}