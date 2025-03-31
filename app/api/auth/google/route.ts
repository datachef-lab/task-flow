import { NextRequest, NextResponse } from 'next/server';
import { upsertGoogleUser, generateTokens, setAuthCookies } from '@/lib/auth';

// Google OAuth2 credentials - store these in environment variables in production
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const REDIRECT_URI = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback` : 'http://localhost:3000/api/auth/google/callback';

// Google OAuth2 endpoint
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Handler for /api/auth/google - redirects to Google login
export async function GET(req: NextRequest) {
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    url.searchParams.append('redirect_uri', REDIRECT_URI);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', 'openid email profile');
    url.searchParams.append('access_type', 'offline');
    url.searchParams.append('prompt', 'consent');

    return NextResponse.redirect(url.toString());
} 