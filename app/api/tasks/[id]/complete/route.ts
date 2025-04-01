import { NextResponse } from "next/server";
import { completeTask } from "@/lib/services/task-service";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Access the id directly without destructuring to avoid the error
        const taskId = parseInt(params.id);

        if (isNaN(taskId)) {
            return NextResponse.json(
                { error: "Invalid task ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const completed = body.completed === undefined ? true : !!body.completed;

        console.log(`API route: Setting task ${taskId} completed status to ${completed}`);

        const updatedTask = await completeTask(taskId, completed);

        if (!updatedTask) {
            return NextResponse.json(
                { error: "Task not found or could not be updated" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, task: updatedTask });
    } catch (error) {
        console.error("Error updating task completion status:", error);
        return NextResponse.json(
            { error: "Failed to update task" },
            { status: 500 }
        );
    }
} 