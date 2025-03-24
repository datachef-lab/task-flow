import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

type CachedConnection = {
    client: postgres.Sql
    db: ReturnType<typeof drizzle>
}

class Database {
    private static instance: CachedConnection | null = null

    private constructor() { } // Prevent direct instantiation

    public static getInstance(): CachedConnection {
        if (!Database.instance) {
            if (!process.env.DATABASE_URL) {
                throw new Error("DATABASE_URL is missing from environment variables")
            }

            console.log("Creating new database connection")
            const client = postgres(process.env.DATABASE_URL, {
                max: 10,
                idle_timeout: 20,
                connect_timeout: 10,
            })
            const db = drizzle(client)
            Database.instance = { client, db }
        } else {
            console.log("Using cached database connection")
        }
        return Database.instance
    }
}

// Export the database instance and sql from drizzle-orm
export const db = Database.getInstance().db
export { sql } from "drizzle-orm"

