import { count, desc, eq, gt } from "drizzle-orm";
import { db } from "../../db";
import { ActivityLog, activityLogModel } from "../../db/schema";

export async function getActivitiesByDate(givenDate: Date = new Date(), page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;

    // Fetch paginated activities
    const activities = await db
        .select()
        .from(activityLogModel)
        .where(gt(activityLogModel.createdAt, givenDate))
        .orderBy(desc(activityLogModel.id))
        .limit(size)
        .offset(offset);

    // Get the total count for pagination
    const totalCount = await db
        .select({ count: count() })
        .from(activityLogModel)
        .where(gt(activityLogModel.createdAt, givenDate));

    const totalPages = Math.ceil(totalCount[0].count / size);

    return {
        data: activities,
        currentPage: page,
        totalPages,
        totalItems: totalCount[0].count,
    };
}

export async function createActivityLog(activityLog: ActivityLog) {
    const { id, ...data } = activityLog;
    const [newActivityLog] = await db
        .insert(activityLogModel)
        .values(data as ActivityLog)
        .returning();

    return newActivityLog;
}

export async function getAllActivities(page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;

    const [activities, totalActivities] = await Promise.all([
        db.select().from(activityLogModel).limit(size).offset(offset).orderBy(desc(activityLogModel.id)),
        db.select({ count: count() }).from(activityLogModel),
    ]);

    const totalPages = Math.ceil(totalActivities[0].count / size);

    return {
        activities,
        currentPage: page,
        totalPages,
        totalactivity: totalActivities[0].count,
    };
}
