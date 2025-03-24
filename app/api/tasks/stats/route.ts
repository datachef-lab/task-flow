import { db } from "@/db";
import { taskModel } from "@/db/schema";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [result] = await db.select({ count: count() }).from(taskModel);
        const [result2] = await db.select({ count: count() }).from(taskModel).where(eq(taskModel.completed, true));
        const [result3] = await db.select({ count: count() }).from(taskModel).where(and(
            eq(taskModel.completed, false),
            gte(taskModel.dueDate, new Date().toISOString())
        ));
        const [result4] = await db.select({ count: count() }).from(taskModel).where(and(
            eq(taskModel.completed, false),
            lt(taskModel.dueDate, new Date().toISOString())
        ));
        
        return NextResponse.json({
            totalTasksCount: result.count,
            totalCompletedTasksCount: result2.count,
            pending: result3.count,
            overdue: result4.count,
        });

    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}