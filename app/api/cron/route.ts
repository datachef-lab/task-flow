import { NextResponse } from "next/server"
import initializeScheduler from "@/lib/cronjob-scheduler"

// Initialize the scheduler when the API route is first loaded
let initialized = false

export async function GET() {
    try {
        if (!initialized) {
            await initializeScheduler()
            initialized = true
        }

        return NextResponse.json({
            success: true,
            message: "Cronjob scheduler is running",
        })
    } catch (error) {
        console.error("Error in cron API route:", error)
        return NextResponse.json({ success: false, error: "Failed to initialize scheduler" }, { status: 500 })
    }
}

