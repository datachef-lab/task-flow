import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Clear authentication cookies
        clearAuthCookies();

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'An error occurred during logout' },
            { status: 500 }
        );
    }
} 