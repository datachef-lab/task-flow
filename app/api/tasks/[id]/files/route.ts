import { NextResponse } from 'next/server';
import { deleteTaskFiles } from '@/lib/services/task-service';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { fileNames } = await request.json();
        const updatedTask = await deleteTaskFiles(parseInt(params.id), fileNames);
        
        if (!updatedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTask);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete files' },
            { status: 500 }
        );
    }
} 