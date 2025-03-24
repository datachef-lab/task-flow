import { db } from "@/db"
import { type Cronjob, cronjobModel } from "@/db/schema"
import { count, eq, sql } from "drizzle-orm"
import { createTask } from "./task-service"
import { createActivityLog } from "./activity-service"

// Ensure all functions are exported correctly
export async function getAllCronjobs(page = 1, size = 10) {
    const offset = (page - 1) * size
    const [cronjobs, totalCronjobs] = await Promise.all([
        db.select().from(cronjobModel).limit(size).offset(offset),
        db.select({ count: count() }).from(cronjobModel),
    ])
    const totalPages = Math.ceil(totalCronjobs[0].count / size)
    return {
        cronjobs,
        currentPage: page,
        totalPages,
        totalCronjobs: totalCronjobs[0].count,
    }
}

export async function getCronjobById(id: number) {
    const [foundCronjob] = await db.select().from(cronjobModel).where(eq(cronjobModel.id, id))
    return foundCronjob || null
}

export async function updateCronjob(id: number, givenCronjob: Cronjob) {
    const foundCronjob = await getCronjobById(id)
    if (!foundCronjob) return null
    const { id: tmpId, ...props } = givenCronjob
    const [updatedCronjob] = await db
        .update(cronjobModel)
        .set({ ...foundCronjob, ...props })
        .where(eq(cronjobModel.id, id))
        .returning()
    return updatedCronjob
}

export async function createCronjob(cronjob: Cronjob) {
    const [createdCronjob] = await db.insert(cronjobModel).values(cronjob).returning()
  
    return createdCronjob
}

export async function deleteCronjob(id: number) {
    const foundCronjob = await getCronjobById(id)
    if (!foundCronjob) return null
    await db.delete(cronjobModel).where(eq(cronjobModel.id, id))
    return foundCronjob
}

export async function checkAndCreateTasks() {
    try {
        const currentTime = new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Cast creationTime to "time without time zone"
        const cronjobs = await db
            .select()
            .from(cronjobModel)
            .where(sql`
                TO_CHAR(${cronjobModel.creationTime}::time, 'HH24:MI:SS') = ${currentTime}
            `);

        console.log(`Found ${cronjobs.length} cronjobs to process at ${currentTime}`);

        for (const cronjob of cronjobs) {
            await createTask({
                assignedUserId: cronjob.userId,
                createdUserId: cronjob.userId,
                description: cronjob.taskDescription,
                priorityType: cronjob.priorityType,
                abbreviation: `AUTO-${cronjob.id}-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: null,
                dueDate: new Date().toISOString(),
                id: 0,
                completed: false,
            })
            console.log(`Task created for Cronjob ID ${cronjob.id}`)
        }
    } catch (error) {
        console.error("Error in checkAndCreateTasks:", error)
        throw error
    }
}
