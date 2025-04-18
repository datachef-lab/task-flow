// app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask } from '@/lib/services/task-service';
import { Task } from '@/db/schema';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const task = await getTaskById(Number(id));
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }
        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch task' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log("params.id :", await params.id);
    const id = await params.id;
    console.log("in api, id:", id);
    try {
        const body = await request.json();
        const task = await updateTask(parseInt(id), body);
        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const task = await deleteTask(parseInt(id));
        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}