import { NextResponse } from "next/server";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponseServerIO } from "@/lib/socket";
import { setSocketIO } from "@/lib/services/task-service";

export async function GET(req: Request) {
    if (!(req as any).socket.server.io) {
        console.log("Initializing Socket.IO server...");
        const io = new SocketIOServer((req as any).socket.server, {
            path: "/api/socketio",
            addTrailingSlash: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        // Set the io instance in the task service
        await setSocketIO(io);

        io.on("connection", (socket) => {
            console.log("Client connected:", socket.id);

            // Join user's personal room
            socket.on("join", (userId: string) => {
                socket.join(`user:${userId}`);
                console.log(`User ${userId} joined their room`);
            });

            // Handle disconnection
            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        (req as any).socket.server.io = io;
    }

    return NextResponse.json({ success: true });
} 