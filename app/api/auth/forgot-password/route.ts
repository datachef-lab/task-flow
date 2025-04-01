import { NextResponse } from "next/server";
import { db } from "@/db";
import { userModel } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/nodemailer";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        // Find user by email
        const [user] = await db.select().from(userModel).where(eq(userModel.email, email));
        console.log(user, email);

        if (!user) {
            // Return success even if user doesn't exist to prevent email enumeration
            return NextResponse.json(
                { message: "If an account exists, you will receive a reset link" },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Update user with reset token
        await db
            .update(userModel)
            .set({
                resetToken,
                resetTokenExpiry,
            })
            .where(eq(userModel.id, user.id));

        // Create reset link
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
        console.log(resetLink);
        // Send reset email
        await sendEmail(

            user.email,
            "Reset Your Password",
            `Click the following link to reset your password: ${resetLink}`,
            `
        <h1>Reset Your Password</h1>
        <p>Click the following link to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        );
        console.log("sended reset link");
        return NextResponse.json(
            { message: "If an account exists, you will receive a reset link" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 }
        );
    }
} 