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
        isAdmin: !!user.isAdmin
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
export async function setAuthCookies(tokens: AuthTokens) {
    const cookieStore = await cookies();

    // Set refresh token in HTTP-only cookie for security
    cookieStore.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/'
    });

    // Just for fallback/compatibility, not the main storage method
    cookieStore.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60, // 15 minutes in seconds
        path: '/'
    });
}

// Clear auth cookies
export async function clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete('refreshToken');
    cookieStore.delete('accessToken');
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
    const users = await db.select().from(userModel).where(eq(userModel.email, email)).limit(1);
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