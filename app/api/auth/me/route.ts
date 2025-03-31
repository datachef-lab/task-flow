import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getUserById } from "@/lib/services/user-service";
import { SignJWT } from "jose";

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
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(refreshToken, secret);
        const userId = payload.sub as string;

        // Get user details
        const user = await getUserById(Number(userId));
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Generate new access token
        const accessToken = await new SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(secret);

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
        console.error("Error in /api/auth/me:", error);
        return NextResponse.json(
            { error: "Failed to verify session" },
            { status: 500 }
        );
    }
} 