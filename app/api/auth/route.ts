import { db } from "@/db";
import { User, userModel } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, isAdmin, whatsappNumber, disabled } = body as User

        if ([name, email, whatsappNumber].some(ele => ele.trim() === '')) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const foundUser = await db
            .select()
            .from(userModel)
            .where(eq(userModel.email, email));


        if (foundUser) {
            return NextResponse.json({ error: "User already exist!" }, { status: 409 })
        }

        const [createdUser] = await db
            .insert(userModel)
            .values({
                name, email, isAdmin, whatsappNumber, disabled
            });


        return NextResponse.json(createdUser)
    } catch (error) {
        console.error("Error creating task:", error)
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }
}