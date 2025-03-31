import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, generateTokens, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get user by email
        const user = await getUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // User is disabled
        if (user.disabled) {
            return NextResponse.json(
                { error: 'Your account has been disabled' },
                { status: 403 }
            );
        }

        // If user is registered via Google OAuth and has no password
        if (!user.password && user.googleId) {
            return NextResponse.json(
                { error: 'Please sign in with Google' },
                { status: 401 }
            );
        }

        // Check if password is correct
        const isPasswordValid = await verifyPassword(password, user.password || '');

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate tokens
        const tokens = generateTokens(user);

        // Set cookies
        setAuthCookies(tokens);

        // Return user data and access token (access token to be stored in app state)
        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                picture: user.picture
            },
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        );
    }
} 