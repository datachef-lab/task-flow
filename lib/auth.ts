import { User } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { userModel } from '@/db/schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// JWT Secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Interface for token payloads
export interface TokenPayload {
    userId: number;
    email: string;
    name: string;
    isAdmin?: boolean;
}

// Interface for auth tokens
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Generate hash for password
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Verify password against hash
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT tokens
export function generateTokens(user: User): AuthTokens {
    const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    return { accessToken, refreshToken };
}

// Verify JWT access token
export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

// Verify JWT refresh token
export function verifyRefreshToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

// Set auth cookies
export function setAuthCookies(tokens: AuthTokens) {
    const cookieStore = cookies();

    // Set refresh token in HTTP-only cookie for security
    cookieStore.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/'
    });

    // Just for fallback/compatibility, not the main storage method
    cookieStore.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes in seconds
        path: '/'
    });
}

// Clear auth cookies
export function clearAuthCookies() {
    const cookieStore = cookies();
    cookieStore.delete('refreshToken');
    cookieStore.delete('accessToken');
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
    const users = await db.select().from(userModel).where(eq(userModel.email, email)).limit(1);
    return users.length > 0 ? users[0] : null;
}

// Get user by Google ID
export async function getUserByGoogleId(googleId: string): Promise<User | null> {
    const users = await db.select().from(userModel).where(eq(userModel.googleId, googleId)).limit(1);
    return users.length > 0 ? users[0] : null;
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
    const users = await db.select().from(userModel).where(eq(userModel.id, id)).limit(1);
    return users.length > 0 ? users[0] : null;
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return null;

    const user = await getUserById(payload.userId);
    if (!user) return null;

    const { accessToken } = generateTokens(user);
    return accessToken;
}

// Create or update a user from Google OAuth data
export async function upsertGoogleUser(profile: any): Promise<User> {
    const { id, email, name, picture } = profile;

    // Check if user exists by Google ID
    let user = await getUserByGoogleId(id);

    if (user) {
        // Update existing user
        const updatedUser = await db
            .update(userModel)
            .set({
                name,
                picture,
                updatedAt: new Date()
            })
            .where(eq(userModel.id, user.id))
            .returning();

        return updatedUser[0];
    }

    // Check if user exists by email
    user = await getUserByEmail(email);

    if (user) {
        // Link Google account to existing user
        const updatedUser = await db
            .update(userModel)
            .set({
                googleId: id,
                picture: picture || user.picture,
                updatedAt: new Date()
            })
            .where(eq(userModel.id, user.id))
            .returning();

        return updatedUser[0];
    }

    // Create new user
    const [newUser] = await db
        .insert(userModel)
        .values({
            name,
            email,
            googleId: id,
            picture,
            isAdmin: false,
            disabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

    return newUser;
} 