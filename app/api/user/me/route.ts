import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, getUserById } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        // Get access token from Authorization header
        const authHeader = req.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'No access token provided' },
                { status: 401 }
            );
        }

        const accessToken = authHeader.split(' ')[1];

        // Verify access token
        const payload = verifyAccessToken(accessToken);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid access token' },
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

        // Return user info
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            picture: user.picture
        });
    } catch (error) {
        console.error('User info fetch error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching user info' },
            { status: 500 }
        );
    }
} 