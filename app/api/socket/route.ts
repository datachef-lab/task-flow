import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { getServerSession } from './auth';

// Store connected users
const connectedUsers = new Map();

// A global variable to store the socket.io server instance
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = new NextResponse();

    // Initialize Socket.io if not already initialized
    if (!io) {
        // @ts-ignore - res.socket is not in the types
        const server = response.socket?.server;

        if (server) {
            io = new SocketIOServer(server, {
                path: '/api/socket',
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST'],
                },
            });

            // Socket.io connection handling
            io.on('connection', (socket) => {
                console.log('A user connected', socket.id);

                // Handle user login
                socket.on('user_login', (userId) => {
                    console.log(`User ${userId} logged in`);
                    connectedUsers.set(socket.id, userId);

                    // Notify client they're connected
                    socket.emit('connected', { message: 'You are connected to the notification system' });
                });

                // Handle user logout
                socket.on('user_logout', () => {
                    if (connectedUsers.has(socket.id)) {
                        console.log(`User ${connectedUsers.get(socket.id)} logged out`);
                        connectedUsers.delete(socket.id);
                    }
                });

                // Handle disconnect
                socket.on('disconnect', () => {
                    console.log('User disconnected');
                    connectedUsers.delete(socket.id);
                });
            });
        }
    }

    return NextResponse.json({ success: true });
}

// Helper function to get the Socket.io server instance
export function getSocketIO() {
    return io;
} 