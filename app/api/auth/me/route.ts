import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, generateAccessToken } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";

export async function GET() {
    try {
        // Get the refresh token from cookies
        const refreshToken = cookies().get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: "No refresh token found" },
                { status: 401 }
            );
        }

        // Verify the refresh token
        const decoded = await verifyToken(refreshToken);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: "Invalid refresh token" },
                { status: 401 }
            );
        }

        // Get user details
        const user = await getUserById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Generate new access token
        const accessToken = await generateAccessToken(user);

        return NextResponse.json({
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error("Error in /auth/me:", error);
        return NextResponse.json(
            { error: "Failed to verify session" },
            { status: 500 }
        );
    }
} 