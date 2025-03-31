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

export async function GET(request: Request) {
    try {
        // Destructure the page, pageNumber, userId
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId')) || undefined;
        const query = searchParams.get('query') as "all" | "pending" | "completed" | "overdue" | "date_extension" | "on_hold" ?? "all";
        const page = Number(searchParams.get('page')) ?? 1;
        const type: "created" | "assigned" = searchParams.get('type') as "created" | "assigned" ?? "assigned";
        const size = Number(searchParams.get('size')) ?? 10;

        let result: {
            tasks: Task[];
            currentPage: number;
            totalPages: number;
            stats: {
                totalTasksCount: number;
                totalCompletedTasksCount: number;
                pending: number;
                overdue: number;
            };
        } = { tasks: [], currentPage: page, totalPages: 1, stats: { totalTasksCount: 0, totalCompletedTasksCount: 0, pending: 0, overdue: 0 } }


        switch (query) {
            case "completed":
                result = await getCompletedTasks(page, size, userId, type);
                break;
            case "overdue":
                result = await getOverdueTasks(page, size, userId, type);
                break;
            case "pending":
                result = await getPendingTasks(page, size, userId, type);
                break;
            default:
                result = await getAllTasks(page, size);
        }

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
        let result;
        const body = await request.json();
        try {
            result = await createTask(body);
        } catch (error) {
            console.log("error in create task:", error);
        }
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
        const updatedTask = await updateTask(body.id, body);
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