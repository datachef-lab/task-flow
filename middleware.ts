import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jsonwebtoken';

// Define types
interface TokenPayload {
    userId: string;
    email: string;
    isAdmin: boolean;
    iat: number;
    exp: number;
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Define public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/signin',
        '/signup',
        '/forgot-password',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
    ];

    // Check if the requested path is in public routes
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith('/api/auth/')
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Get the refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // If no refresh token, redirect to login
    if (!refreshToken) {
        const url = new URL('/signin', request.url);
        return NextResponse.redirect(url);
    }

    try {
        // Verify the token (in a real implementation, use the secret from env)
        const decoded = jose.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key'
        ) as TokenPayload;

        // Token is valid, proceed
        return NextResponse.next();
    } catch (error) {
        // Token is invalid, redirect to login
        const url = new URL('/signin', request.url);
        return NextResponse.redirect(url);
    }
}

// Define which paths this middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * 1. /api/auth/* (authentication API routes)
         * 2. /_next (Next.js internals)
         * 3. /fonts, /icons, /images (static files)
         * 4. /favicon.ico, /sitemap.xml (static files)
         */
        '/((?!_next|fonts|icons|images|favicon.ico|sitemap.xml).*)',
    ],
}