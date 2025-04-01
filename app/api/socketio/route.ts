import { NextResponse } from "next/server";
import { createSocketIOServer, getSocketIO } from "@/lib/socket-server";
import { setSocketIO } from "@/lib/services/task-service";

export async function GET(req: Request) {
    try {
        // Get or create the Socket.IO server
        const io = getSocketIO() || createSocketIOServer();

        // Set the IO instance in the task service
        try {
            await setSocketIO(io);
        } catch (error) {
            console.error("Error setting Socket.IO in task service:", error);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error initializing Socket.IO:", error);
        return NextResponse.json(
            { success: false, error: "Failed to initialize Socket.IO" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    return GET(req);
}

export async function OPTIONS(req: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 