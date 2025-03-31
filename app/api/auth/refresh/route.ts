import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken, getUserById, generateTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Get refresh token from cookies
        const cookieStore = cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        // No refresh token, return error
        if (!refreshToken) {
            return NextResponse.json(
                { error: 'No refresh token provided' },
                { status: 401 }
            );
        }

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid refresh token' },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await getUserById(payload.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // User is disabled
        if (user.disabled) {
            return NextResponse.json(
                { error: 'Your account has been disabled' },
                { status: 403 }
            );
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        // Set new refresh token cookie
        cookieStore.set('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: '/'
        });

        // Return new access token
        return NextResponse.json({
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { error: 'An error occurred during token refresh' },
            { status: 500 }
        );
    }
} 