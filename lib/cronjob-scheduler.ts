import cron from "node-cron"
import { checkAndCreateTasks } from "@/lib/services/cronjob-service.server"
import { db } from "@/db"
import { cronjobModel } from "@/db/schema"

export async function initializeScheduler() {
    try {
        // Test DB connection
        await db.select().from(cronjobModel).limit(1)
        console.log("Database connection verified")

        // Schedule job to run every minute
        cron.schedule("* * * * *", async () => {
            console.log("Running scheduled cronjob tasks...")
            try {
                await checkAndCreateTasks()
            } catch (error) {
                console.error("Error while running scheduled tasks:", error)
            }
        })

        console.log("Cronjob scheduler initialized successfully")
    } catch (error) {
        console.error("Failed to initialize cron scheduler:", error)
        throw error
    }
}

// Export the function instead of immediately calling it
export default initializeScheduler

