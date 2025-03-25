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

const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;
const INTERAKT_BASE_URL = process.env.INTERAKT_BASE_URL;

export async function getAllTasks(page: number = 1, size: number = 100) {
    const offset = (page - 1) * size;

    const [tasks, totalTasks] = await Promise.all([
        db.select().from(taskModel).limit(size).offset(offset).orderBy(desc(taskModel.createdAt)),
        db.select({ count: count() }).from(taskModel),
    ]);

    const totalPages = Math.ceil(totalTasks[0].count / size);

    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
    };
}

export async function getPendingTasks(page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;
    const today = new Date().toISOString().split('T')[0]; // Convert to YYYY-MM-DD

    const [tasks, totalTasks] = await Promise.all([
        db.
            select()
            .from(taskModel)
            .where(and(
                eq(taskModel.completed, false),
                gte(taskModel.dueDate, today),
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

    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
    };
}

export async function getOverdueTasks(page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;
    const today = new Date().toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    console.log("today:", today)
    const [tasks, totalTasks] = await Promise.all([
        db.
            select()
            .from(taskModel)
            .where(and(
                eq(taskModel.completed, false),
                lt(taskModel.dueDate, today),
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

    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
    };
}

export async function getCompletedTasks(page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;

    const [tasks, totalTasks] = await Promise.all([
        db.
            select()
            .from(taskModel)
            .where(eq(taskModel.completed, true))
            .orderBy(desc(taskModel.id))
            .limit(size)
            .offset(offset),
        db.select({ count: count() }).from(taskModel).where(eq(taskModel.completed, false)),
    ]);

    const totalPages = Math.ceil(totalTasks[0].count / size);

    return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks: totalTasks[0].count,
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

async function handleTaskFiles(taskId: number, files: File[]): Promise<Array<{ name: string; path: string; type: string }>> {
    const uploadDir = join(process.cwd(), "documents", taskId.toString());
    
    // Create task directory if it doesn't exist
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    const savedFiles: Array<{ name: string; path: string; type: string }> = [];

    for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = file.name;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        savedFiles.push({
            name: fileName,
            path: `/documents/${taskId}/${fileName}`,
            type: file.type
        });
    }

    return savedFiles;
}

export async function createTask(givenTask: Task, files?: FileList) {
    const { id, ...props } = givenTask;
    
    // Handle file uploads if provided
    let savedFiles: Array<{ name: string; path: string; type: string }> = [];
    if (files && files.length > 0) {
        savedFiles = await handleTaskFiles(givenTask.id, Array.from(files));
    }

    const [newTask] = await db
        .insert(taskModel)
        .values({ ...props, files: savedFiles })
        .returning();

    await createActivityLog({
        actionType: "create",
        createdAt: new Date(),
        id: 0,
        taskId: newTask.id,
        userId: newTask.assignedUserId
    });

    return newTask;
}

export async function updateTask(id: number, givenTask: Task, files?: FileList) {
    const foundTask = await getTaskById(id);

    if (!foundTask) {
        return null;
    }

    const { id: tmpId, ...props } = givenTask;

    // Handle file uploads if provided
    let savedFiles: Array<{ name: string; path: string; type: string }> = (foundTask.files || []) as Array<{ name: string; path: string; type: string }>;
    if (files && files.length > 0) {
        const newFiles = await handleTaskFiles(id, Array.from(files));
        savedFiles = [...savedFiles, ...newFiles];
    }

    const [updatedTask] = await db
        .update(taskModel)
        .set({ ...props, files: savedFiles })
        .where(eq(taskModel.id, id))
        .returning();

    await createActivityLog({
        actionType: "update",
        createdAt: new Date(),
        id: 0,
        taskId: updatedTask.id,
        userId: updatedTask.assignedUserId
    });

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
    await deleteTaskDirectory(id);

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
    const remainingFiles = ((task.files || []) as Array<{ name: string; path: string; type: string }>).filter(
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