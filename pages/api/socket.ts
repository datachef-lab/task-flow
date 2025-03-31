import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Store connected users
const connectedUsers = new Map();

// Initialize Socket.io server
const ioHandler = (req: NextApiRequest, res: NextApiResponse & { socket: { server: NetServer } }) => {
    if (!res.socket.server.io) {
        console.log('Initializing Socket.io server...');

        const io = new SocketIOServer(res.socket.server, {
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

        // Attach io to the response object for future reference
        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler; 