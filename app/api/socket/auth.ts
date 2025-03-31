import { cookies } from 'next/headers';
import { verifyRefreshToken } from '@/lib/auth';

export async function getServerSession() {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
        return null;
    }

    const tokenPayload = verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
        return null;
    }

    return {
        user: {
            id: tokenPayload.userId,
            email: tokenPayload.email,
            name: tokenPayload.name,
            isAdmin: tokenPayload.isAdmin,
        }
    };
} 