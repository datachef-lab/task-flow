"use server";

import { createTask, updateTask } from "@/lib/services/task-service";
import { Task } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function handleTaskAction(
    type: "add" | "edit",
    task: Task,
    files?: FileList
): Promise<void> {
    try {
        if (type === "add") {
            const newTask = await createTask(task, files);
            console.log("newTask:", newTask);
            if (!newTask) throw new Error("Failed to create task");
            revalidatePath("/dashboard");
            return;
        } else {
            const savedTask = await updateTask(task.id, task, files);
            console.log("savedTask:", savedTask);
            if (!savedTask) throw new Error("Failed to update task");
            revalidatePath("/dashboard");
            return;
        }
    } catch (error) {
        console.error("Error in handleTaskAction:", error);
        throw error;
    }
}