import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, generateAccessToken } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";

export async function GET() {
    try {
        // Get the refresh token from cookies
        const cookieStore = cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: "No refresh token found" },
                { status: 401 }
            );
        }

        // Verify the refresh token
        const payload = verifyToken(refreshToken);
        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: "Invalid refresh token" },
                { status: 401 }
            );
        }

        // Get user details
        const user = await getUserById(payload.userId as number);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Generate new access token
        const accessToken = generateAccessToken(user.id);

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