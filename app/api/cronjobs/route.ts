import { NextRequest, NextResponse } from "next/server";
import { createCronjob, getAllCronjobs } from "@/lib/services/cronjob-service.server";
import { Cronjob } from "@/db/schema";

// ✅ GET All Cronjobs
export async function GET(request: NextRequest) {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const size = parseInt(request.nextUrl.searchParams.get("size") || "10");

    try {
        const result = await getAllCronjobs(page, size);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching cronjobs:", error);
        return NextResponse.json({ error: "Failed to fetch cronjobs" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { id, ...data } = await request.json() as Cronjob;

        // Validate and parse dates
        if (data.creationTime) {
            const creationTimeDate = new Date(data.creationTime);
            if (isNaN(creationTimeDate.getTime())) {
                throw new Error("Invalid creationTime");
            }
            data.creationTime = creationTimeDate.toISOString().split('T')[1].slice(0, 8); // Extract only the time part
        }

        
        if (data.createdAt) {
            data.createdAt = new Date(data.createdAt);
            if (isNaN(data.createdAt.getTime())) {
                throw new Error("Invalid createdAt");
            }
        }
        if (data.updatedAt) {
            data.updatedAt = new Date(data.updatedAt);
            if (isNaN(data.updatedAt.getTime())) {
                throw new Error("Invalid updatedAt");
            }
        }

        const createdCronjob = await createCronjob(data as Cronjob);
        return NextResponse.json(createdCronjob, { status: 201 });
    } catch (error: any) {
        console.error("Error creating cronjob:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create cronjob" }, { status: 500 });
    }
}
