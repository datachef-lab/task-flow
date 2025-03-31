import { db } from "@/db";
import { taskModel } from "@/db/schema";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        // Destructure the page, pageNumber, userId
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId')) || undefined;
        const page = Number(searchParams.get('page')) ?? 1;
        const type: "created" | "assigned" = searchParams.get('type') as "created" | "assigned" ?? "assigned";
        const size = Number(searchParams.get('size')) ?? 10;

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