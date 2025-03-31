import { NextRequest, NextResponse } from 'next/server';
import { upsertGoogleUser, generateTokens, setAuthCookies } from '@/lib/auth';

// Google OAuth2 credentials - store these in environment variables in production
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const REDIRECT_URI = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback` : 'http://localhost:3000/api/auth/google/callback';

// Google OAuth2 endpoint
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Handler for /api/auth/google/callback - processes the callback from Google
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/signin?error=no_code', req.url));
    }

    try {
        // Exchange authorization code for tokens
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Error getting tokens:', tokenData);
            return NextResponse.redirect(new URL('/signin?error=token_error', req.url));
        }

        // Use access token to get user info
        const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const userInfo = await userInfoResponse.json();

        if (!userInfoResponse.ok) {
            console.error('Error getting user info:', userInfo);
            return NextResponse.redirect(new URL('/signin?error=userinfo_error', req.url));
        }

        // Create or update user
        const user = await upsertGoogleUser({
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
        });

        // Generate JWT tokens
        const tokens = generateTokens(user);

        // Set cookies
        setAuthCookies(tokens);

        // Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(new URL('/signin?error=oauth_error', req.url));
    }
} 