"use server";

import { and, count, desc, eq, gt, gte, lt } from "drizzle-orm";
import { db } from "../../db";
import { sql } from 'drizzle-orm';
import { Task, taskModel } from "../../db/schema";
import { createActivityLog } from "./activity-service";
import { getUserById } from "./user-service";
import { sendEmail } from "../nodemailer";

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

export async function updateTask(id: number, givenTask: Task) {
    const foundTask = await getTaskById(id);

    if (!foundTask) {
        return null;
    }

    const { id: tmpId, ...props } = givenTask;

    const [updatedTask] = await db
        .update(taskModel)
        .set({ ...foundTask, ...props })
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

export async function createTask(task: Task) {
    const { id, ...data } = task;

    // Set the abbreviation
    data.abbreviation = await getAbbreviation(data.priorityType);

    // Create the task
    const [createdTask] = await db
        .insert(taskModel)
        .values(data)
        .returning();

    console.log("Task Created:", createdTask);

    // TODO: Log the activity
    await createActivityLog({
        actionType: "create",
        createdAt: new Date(),
        id: 0,
        taskId: createdTask.id,
        userId: createdTask.createdUserId
    });

    // TODO: Send the email
    const user = await getUserById(createdTask.assignedUserId as number);

    // Send the email
    await sendEmail(
        user?.email as string,
        'Task Assignment',
        `Task "${data.abbreviation}" has been assigned to you.`
    );

    // TODO: Send the WhatsApp

    return createdTask;
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
    const foundTask = await getTaskById(id);

    if (!foundTask) {
        return null;
    }

    await db.delete(taskModel).where(eq(taskModel.id, id));



    return foundTask;
}