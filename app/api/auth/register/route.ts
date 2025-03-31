import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, hashPassword, generateTokens, setAuthCookies } from '@/lib/auth';
import { db } from '@/db';
import { userModel } from '@/db/schema';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const [newUser] = await db
            .insert(userModel)
            .values({
                name,
                email,
                password: hashedPassword,
                isAdmin: false,
                disabled: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // Generate tokens
        const tokens = generateTokens(newUser);

        // Set cookies
        setAuthCookies(tokens);

        // Return user data and access token
        return NextResponse.json({
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
            },
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'An error occurred during registration' },
            { status: 500 }
        );
    }
} 