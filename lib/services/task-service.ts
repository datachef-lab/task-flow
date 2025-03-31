"use server";

import { and, count, desc, eq, gt, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { sql } from 'drizzle-orm';
import { activityLogModel, Task, taskModel } from "@/db/schema";
import { createActivityLog } from "./activity-service";
import { getUserById } from "./user-service";
import { sendEmail } from "../nodemailer";
import { deleteTaskDirectory, deleteTaskFile } from './file-service';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { emitNotification } from "@/lib/socket";

const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;
const INTERAKT_BASE_URL = process.env.INTERAKT_BASE_URL;
const DOCUMENT_PATH = process.env.DOCUMENT_PATH;

let io: any = null;

export async function setSocketIO(ioInstance: any) {
    io = ioInstance;
    return { success: true };
}

export async function getStats(userId: number | undefined, type: "created" | "assigned") {
    try {
        const whereConditions = [];

        if (userId) {

            if (type === "created") {
                whereConditions.push(eq(taskModel.createdUserId, userId));
            }
            else {
                whereConditions.push(eq(taskModel.assignedUserId, userId));
            }
        }

        const [result] = await db
            .select({ count: count() })
            .from(taskModel)
            .where(and(...whereConditions));

        const [result2] = await db
            .select({ count: count() })
            .from(taskModel)
            .where(
                and(
                    eq(taskModel.completed, true),
                    ...whereConditions
                )
            );

        const [result3] = await db
            .select({ count: count() })
            .from(taskModel)
            .where(
                and(
                    eq(taskModel.completed, false),
                    gte(taskModel.dueDate, new Date().toISOString()),
                    ...whereConditions,
                )
            );

        const [result4] = await db
            .select({ count: count() })
            .from(taskModel)
            .where(
                and(
                    eq(taskModel.completed, false),
                    lt(taskModel.dueDate, new Date().toISOString()),
                    ...whereConditions,
                )
            );

        return {
            totalTasksCount: result.count,
            totalCompletedTasksCount: result2.count,
            pending: result3.count,
            overdue: result4.count,
        };

    } catch (error) {
        console.error("Error fetching tasks:", error);
        return {
            totalTasksCount: -1,
            totalCompletedTasksCount: -1,
            pending: -1,
            overdue: -1,
        };
    }
}

export async function getAllTasks(page: number = 1, pageSize: number = 10) {
    try {
        const offset = (page - 1) * pageSize;

        const [tasks, totalCount] = await Promise.all([
            db
                .select()
                .from(taskModel)
                .orderBy(desc(taskModel.createdAt))
                .limit(pageSize)
                .offset(offset),
            db.select({ count: count() }).from(taskModel),
        ]);

        const totalPages = Math.ceil(totalCount[0].count / pageSize);

        const stats = await getStats(undefined, "assigned");
        return {
            tasks,
            totalPages,
            currentPage: page,
            stats,
        };
    } catch (error) {
        console.error("Error fetching all tasks:", error);
        throw error;
    }
}

export async function getPendingTasks(page: number = 1, size: number = 10, userId?: number, type?: "created" | "assigned") {
    const offset = (page - 1) * size;
    const today = new Date().toISOString().split('T')[0]; // Convert to YYYY-MM-DD

    const whereConditions = []
    if (userId) {
        if (type === "created") {
            whereConditions.push(eq(taskModel.createdUserId, userId));
        }
        else {
            whereConditions.push(eq(taskModel.assignedUserId, userId));
        }
    }

    const [tasks, totalTasks] = await Promise.all([
        db.
            select()
            .from(taskModel)
            .where(and(
                eq(taskModel.completed, false),
                gte(taskModel.dueDate, today),
                ...whereConditions,
            ))
            .limit(size)
            .orderBy(desc(taskModel.id))
            .offset(offset),
        db.select({ count: count() }).from(taskModel).where(and(
            eq(taskModel.completed, false),
            gte(taskModel.dueDate, today),
        )),
    ]);

    const totalPages = Math.ceil(totalTasks[0].count / size);

    const stats = await getStats(userId, "assigned");
    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
        stats,
    };
}

export async function getOverdueTasks(page: number = 1, size: number = 10, userId?: number, type?: "created" | "assigned") {
    const offset = (page - 1) * size;
    const today = new Date().toISOString().split('T')[0]; // Convert to YYYY-MM-DD

    const whereConditions = []
    if (userId) {
        if (type === "created") {
            whereConditions.push(eq(taskModel.createdUserId, userId));
        }
        else {
            whereConditions.push(eq(taskModel.assignedUserId, userId));
        }
    }

    const [tasks, totalTasks] = await Promise.all([
        db.
            select()
            .from(taskModel)
            .where(and(
                eq(taskModel.completed, false),
                lt(taskModel.dueDate, today),
                ...whereConditions,
            ))
            .orderBy(desc(taskModel.id))
            .limit(size)
            .offset(offset),
        db.select({ count: count() }).from(taskModel).where(and(
            eq(taskModel.completed, false),
            lt(taskModel.dueDate, today),
        )),
    ]);

    const totalPages = Math.ceil(totalTasks[0].count / size);

    const stats = await getStats(userId, "assigned");
    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
        stats,
    };
}

export async function getCompletedTasks(page: number = 1, size: number = 10, userId?: number, type?: "created" | "assigned") {
    const offset = (page - 1) * size;

    const whereConditions = []
    if (userId) {
        if (type === "created") {
            whereConditions.push(eq(taskModel.createdUserId, userId));
        }
        else {
            whereConditions.push(eq(taskModel.assignedUserId, userId));
        }
    }

    const [tasks, totalTasks] = await Promise.all([
        db.
            select()
            .from(taskModel)
            .where(and(
                eq(taskModel.completed, true),
                ...whereConditions,
            ))
            .orderBy(desc(taskModel.id))
            .limit(size)
            .offset(offset),
        db.select({ count: count() }).from(taskModel).where(eq(taskModel.completed, false)),
    ]);

    const totalPages = Math.ceil(totalTasks[0].count / size);

    const stats = await getStats(userId, "assigned");
    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
        stats,
    };
}

export async function getTaskById(id: number) {
    const [foundTask] = await db
        .select()
        .from(taskModel)
        .where(eq(taskModel.id, id));

    if (!foundTask) {
        return null;
    }

    return foundTask;
}

async function handleTaskFiles(taskId: number, files: File[]): Promise<Array<{ name: string; path: string; type: string; size: number }>> {
    const uploadDir = join(DOCUMENT_PATH!, 'documents', taskId.toString());

    // Create task directory if it doesn't exist
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    const savedFiles: Array<{ name: string; path: string; type: string; size: number }> = [];

    for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = file.name;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        const fileInfo = {
            name: fileName,
            path: filePath,
            type: file.type,
            size: file.size
        };
        savedFiles.push(fileInfo);
        console.log(`Added file info: ${JSON.stringify(fileInfo)}`);
    }

    return savedFiles;
}

export async function createTask(givenTask: Task, files?: FileList) {
    const { id, ...props } = givenTask;
    console.log("in create task,", props);

    try {
        const abbreviation = await getAbbreviation(givenTask.priorityType);
        const [newTask] = await db
            .insert(taskModel)
            .values({ ...props, abbreviation })
            .returning();

        // Handle file uploads if provided
        let savedFiles: Array<{ name: string; path: string; type: string }> = [];
        if (files && files.length > 0) {
            savedFiles = await handleTaskFiles(newTask.id, Array.from(files));

            // Update the task with file information
            const [updatedTask] = await db
                .update(taskModel)
                .set({ files: savedFiles })
                .where(eq(taskModel.id, newTask.id))
                .returning();

            if (updatedTask) {
                newTask.files = updatedTask.files;
            }
        }

        await createActivityLog({
            actionType: "create",
            createdAt: new Date(),
            id: 0,
            taskId: newTask.id,
            userId: newTask.assignedUserId
        });

        // Send the email
        const createdUser = await getUserById(newTask.createdUserId as number);
        const assignedUser = await getUserById(newTask.assignedUserId as number);

        await sendEmail(
            assignedUser?.email as string,
            'Task Assignment',
            `Task "${newTask.abbreviation}" has been assigned to you.`
        );

        // TODO: Send the WhatsApp
        await sendWhatsAppMessage(assignedUser?.whatsappNumber as string, [
            assignedUser?.name as string,
            newTask.abbreviation || "default_user",
            createdUser?.name as string,
            newTask.dueDate?.toString() || 'default_date',
        ], "task_assigned");

        // Emit notification for task creation
        if (io) {
            emitNotification(io, newTask.assignedUserId!, {
                type: "task_created",
                taskId: newTask.id,
                taskTitle: newTask.description,
                userId: newTask.createdUserId as number,
                userName: "System", // You'll need to fetch the actual user name
                timestamp: new Date(),
                message: `New task "${newTask.description}" has been assigned to you`,
            });
        }

        return newTask;
    } catch (error) {
        console.error("Error creating task:", error);
    }

    return null;
}

export async function updateTask(id: number, givenTask: Task, files?: FileList) {
    console.log("updateTask called with id:", id, "and task:", givenTask);

    const foundTask = await getTaskById(id);

    if (!foundTask) {
        console.error(`Task with ID ${id} not found for update`);
        return null;
    }

    const { id: tmpId, createdAt, updatedAt, ...props } = givenTask;

    // Handle file uploads if provided
    let savedFiles: Array<{ name: string; path: string; type: string; size?: string }> =
        (foundTask.files || []) as Array<{ name: string; path: string; type: string; size?: string }>;

    console.log("Current files:", savedFiles);

    if (files && files.length > 0) {
        console.log(`Processing ${files.length} new files in updateTask`);
        const newFiles = await handleTaskFiles(id, Array.from(files));
        const convertedNewFiles = newFiles.map(file => ({ ...file, size: file.size.toString() }));
        savedFiles = [...savedFiles, ...convertedNewFiles];
        console.log("Files after adding new uploads:", savedFiles);
    }

    // If task update includes files property, use it instead
    if (props.files) {
        console.log("Task update includes files property, using it directly");
        savedFiles = props.files as any[];
    }

    console.log("Final files array for update:", savedFiles);

    let updatedTask: Task | null = null;

    try {
        const [savedTask] = await db
            .update(taskModel)
            .set({ ...props, files: savedFiles })
            .where(eq(taskModel.id, id))
            .returning();

        console.log("Updated task in database:", savedTask);
        updatedTask = savedTask;

    } catch (error) {
        console.error("Error updating task in database:", error);
        return null;
    }

    await createActivityLog({
        actionType: "update",
        createdAt: new Date(),
        id: 0,
        taskId: updatedTask?.id as number,
        userId: updatedTask?.assignedUserId as number
    });

    // Emit notification for status change
    if (io) {
        emitNotification(io, updatedTask?.assignedUserId as number, {
            type: updatedTask?.completed ? "task_completed" : "task_updated",
            taskId: updatedTask?.id as number,
            taskTitle: updatedTask?.description,
            userId: updatedTask?.createdUserId as number,
            userName: "System", // You'll need to fetch the actual user name
            timestamp: new Date(),
            message: `Task "${updatedTask?.description}" has been ${updatedTask?.completed ? "completed" : "updated"}`,
        });
    }

    return updatedTask;
}

export async function getAbbreviation(priority: "normal" | "medium" | "high") {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Get the count of the tasks created in the current month
    const [taskCount] = await db
        .select({ count: sql`COUNT(*)` })
        .from(taskModel)
        .where(
            sql`EXTRACT(YEAR FROM ${taskModel.createdAt}) = ${currentYear} AND EXTRACT(MONTH FROM ${taskModel.createdAt}) = ${currentMonth}`
        );

    // Get the last task created in the current month
    const [lastTask] = await db
        .select({ abbreviation: taskModel.abbreviation })
        .from(taskModel)
        .where(
            sql`EXTRACT(YEAR FROM ${taskModel.createdAt}) = ${currentYear} AND EXTRACT(MONTH FROM ${taskModel.createdAt}) = ${currentMonth}`
        )
        .orderBy(sql`id DESC`)
        .limit(1);

    // Generate abbreviation
    const comp1 = priority.charAt(0).toUpperCase();
    const comp2 = currentYear.toString().substring(2); // Only last 2 digits
    const comp3 = currentMonth.toString().padStart(2, '0');
    let comp4 = 1;

    if (lastTask?.abbreviation) {
        // Extract the last number part from abbreviation
        const lastNumber = parseInt(lastTask.abbreviation.substring(5), 10);
        comp4 = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    const abbreviation = `${comp1}${comp2}${comp3}${comp4.toString().padStart(4, '0')}`; // Always 4 digits for comp4

    return abbreviation;
}

export async function deleteTask(id: number) {
    // Delete all files associated with the task
    try {
        await deleteTaskDirectory(id);
    } catch (error) {
        console.log(error);
    }
    // Delete all the activities
    await db.delete(activityLogModel).where(eq(activityLogModel.taskId, id));

    // Delete the task from the database
    const [deletedTask] = await db
        .delete(taskModel)
        .where(eq(taskModel.id, id))
        .returning();

    return deletedTask;
}

export async function deleteTaskFiles(taskId: number, fileNames: string[]) {
    const task = await getTaskById(taskId);
    if (!task) return null;

    // Delete each file
    for (const fileName of fileNames) {
        await deleteTaskFile(taskId, fileName);
    }

    // Update the task's files array
    const remainingFiles = ((task.files || []) as Array<{ name: string; path: string; type: string; size: number }>).filter(
        (file) => !fileNames.includes(file.name)
    );

    const [updatedTask] = await db
        .update(taskModel)
        .set({ files: remainingFiles })
        .where(eq(taskModel.id, taskId))
        .returning();

    return updatedTask;
}

export const sendWhatsAppMessage = async (to: string, messageArr: string[] = [], templateName: string) => {
    console.log("messageArr:", messageArr);
    try {
        const requestBody = {
            countryCode: '+91',
            phoneNumber: to,
            type: 'Template',
            template: {
                name: templateName,
                languageCode: 'en',
                headerValues: ['Alert'],
                bodyValues: messageArr,
            },
            data: {
                message: '',
            },
        };
        // 
        const response = await fetch(`https://api.interakt.ai/v1/public/message/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${INTERAKT_API_KEY}`,
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response Status:', response.status);
        console.log('Response Headers:', [...response.headers.entries()]);

        if (!response.ok) {
            const errorResponse = await response.json(); // Log the error response
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${JSON.stringify(errorResponse)}`);
        }

        const data = await response.json()
        console.log(data)

        return data;

    } catch (error) {
        console.error(error);
        // throw error
    }
}

export async function getTasksAssignedByMe(userId: number, page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;

    const [tasks, totalTasks] = await Promise.all([
        db
            .select()
            .from(taskModel)
            .where(eq(taskModel.createdUserId, userId))
            .orderBy(desc(taskModel.createdAt))
            .limit(size)
            .offset(offset),
        db
            .select({ count: count() })
            .from(taskModel)
            .where(eq(taskModel.createdUserId, userId)),
    ]);

    const totalPages = Math.ceil(totalTasks[0].count / size);

    const stats = await getStats(userId, "created");
    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
        stats,
    };
}

export async function getTasksAssignedToMe(userId: number, page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;

    const [tasks, totalTasks] = await Promise.all([
        db
            .select()
            .from(taskModel)
            .where(eq(taskModel.assignedUserId, userId))
            .orderBy(desc(taskModel.createdAt))
            .limit(size)
            .offset(offset),
        db
            .select({ count: count() })
            .from(taskModel)
            .where(eq(taskModel.assignedUserId, userId)),
    ]);

    const totalPages = Math.ceil(totalTasks[0].count / size);

    const stats = await getStats(userId, "assigned");
    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
        stats,
    };
}

export async function updateTaskStatus(
    taskId: number,
    status: TaskStatus
): Promise<Task> {
    try {
        const task = await db.task.update({
            where: { id: taskId },
            data: { status },
        });

        // Emit notification for status change
        if (io) {
            emitNotification(io, task.assignedUserId, {
                type: status === "completed" ? "task_completed" : "task_updated",
                taskId: task.id,
                taskTitle: task.title,
                userId: task.createdUserId,
                userName: "System", // You'll need to fetch the actual user name
                timestamp: new Date(),
                message: `Task "${task.title}" has been ${status}`,
            });
        }

        return task;
    } catch (error) {
        console.error("Error updating task status:", error);
        throw error;
    }
}

export async function requestDateExtension(
    taskId: number,
    requestedDate: Date,
    reason: string
): Promise<Task> {
    try {
        const task = await db.task.update({
            where: { id: taskId },
            data: {
                requestedDate,
                requestDateExtensionReason: reason,
            },
        });

        // Emit notification for extension request
        if (io) {
            emitNotification(io, task.createdUserId, {
                type: "task_extension_requested",
                taskId: task.id,
                taskTitle: task.title,
                userId: task.assignedUserId,
                userName: "System", // You'll need to fetch the actual user name
                timestamp: new Date(),
                message: `Date extension requested for task "${task.title}"`,
            });
        }

        return task;
    } catch (error) {
        console.error("Error requesting date extension:", error);
        throw error;
    }
}

export async function handleDateExtensionRequest(
    taskId: number,
    approved: boolean
): Promise<Task> {
    try {
        const task = await db.task.update({
            where: { id: taskId },
            data: {
                ...(approved
                    ? {
                        dueDate: task.requestedDate,
                        requestedDate: null,
                        requestDateExtensionReason: null,
                    }
                    : {
                        requestedDate: null,
                        requestDateExtensionReason: null,
                    }),
            },
        });

        // Emit notification for extension request response
        if (io) {
            emitNotification(io, task.assignedUserId, {
                type: approved ? "task_extension_approved" : "task_extension_rejected",
                taskId: task.id,
                taskTitle: task.title,
                userId: task.createdUserId,
                userName: "System", // You'll need to fetch the actual user name
                timestamp: new Date(),
                message: `Date extension request for task "${task.title}" has been ${approved ? "approved" : "rejected"
                    }`,
            });
        }

        return task;
    } catch (error) {
        console.error("Error handling date extension request:", error);
        throw error;
    }
}