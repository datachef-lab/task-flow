import { NextResponse } from "next/server";
import { db } from "@/db";
import { userModel } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hash } from "bcrypt";

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { message: "Token and password are required" },
                { status: 400 }
            );
        }

        // Find user with valid reset token
        const [user] = await db.select().from(userModel).where(and(
            eq(userModel.resetToken, token),
            gt(userModel.resetTokenExpiry, new Date())
        ));

        if (!user) {
            return NextResponse.json(
                { message: "Invalid or expired reset token" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hash(password, 12);

        // Update user password and clear reset token
        await db
            .update(userModel)
            .set({
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            })
            .where(eq(userModel.id, user?.id));

        return NextResponse.json(
            { message: "Password reset successful" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 }
        );
    }
} 