import { ActivityLog } from "@/db/schema";
import { createActivityLog, getAllActivities } from "@/lib/services/activity-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { id, ...data } = await request.json() as ActivityLog;

        const createdActivityLog = await createActivityLog(data as ActivityLog);

        return NextResponse.json(createdActivityLog, { status: 201 });

    } catch (error: any) {
        console.error("Error creating cronjob:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create cronjob" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const size = parseInt(request.nextUrl.searchParams.get("size") || "10");

    try {
        const result = await getAllActivities(page, size);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching cronjobs:", error);
        return NextResponse.json({ error: "Failed to fetch cronjobs" }, { status: 500 });
    }
}
