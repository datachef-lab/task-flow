import { db } from "@/db";
import { User, userModel } from "@/db/schema";
import { createUser } from "@/lib/services/user-service";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const createdUser = await createUser(body)
        
        return NextResponse.json(createdUser)
    } catch (error) {
        console.error("Error creating task:", error)
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }
}