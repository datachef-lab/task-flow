// app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import {
    getAllTasks,
    createTask,
    getPendingTasks,
    getOverdueTasks,
    getCompletedTasks,
    updateTask,
    deleteTask
} from '@/lib/services/task-service';
import { Task } from '@/db/schema';

export async function GET() {
    try {
        const result = await getAllTasks();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await createTask(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const updatedTask = await updateTask(body.id , body);
        return NextResponse.json(updatedTask);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const deletedTask = await deleteTask(id);
        return NextResponse.json(deletedTask);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}