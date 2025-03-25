import type { InferModel } from "drizzle-orm"
import { pgTable, serial, text, timestamp, boolean, integer, pgEnum, varchar, date, time } from "drizzle-orm/pg-core"

// Enums
export const priorityEnum = pgEnum("priority_type", ["normal", "medium", "high"])

// export const departmentEnum = pgEnum("department_type", [""])

export const intervalEnum = pgEnum("interval_type", ["daily", "weekly", "monthly", "quarterly", "half_yearly", "yearly"]);

export const actionEnum = pgEnum("action_type", ["create", "update", "delete", "completed"]);

export const taskStatusEnum = pgEnum("task_status_type", ["completed", "on_hold", "request_date_extension"]);

// Tables
export const userModel = pgTable("users", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    whatsappNumber: varchar("whatsapp_number", { length: 255 }).notNull(),
    isAdmin: boolean("is_admin").default(false),
    disabled: boolean().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
})

// export const departments = pgTable("user_departments", {
//     id: serial().primaryKey(),
//     userId: integer().notNull().references(() => userModel.id),
//     type: text("name").notNull(),
//     createdAt: timestamp("created_at").defaultNow(),
//     updatedAt: timestamp("updated_at").defaultNow(),
// })

export const taskModel = pgTable("tasks", {
    id: serial().primaryKey(),
    abbreviation: varchar({ length: 255 }).notNull().unique(),
    description: varchar({ length: 2000 }).notNull(),
    assignedUserId: integer("assigned_user_id_fk").references(() => userModel.id),
    createdUserId: integer("created_user_id_fk").references(() => userModel.id),
    dueDate: date("due_date").defaultNow(),
    priorityType: priorityEnum("priority_type").default("normal").notNull(),
    completed: boolean().notNull().default(false),
    status: taskStatusEnum(),
    remarks: varchar({ length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
})

export const cronjobModel = pgTable("cronjobs", {
    id: serial("id").primaryKey(),
    taskDescription: varchar("task_description", { length: 2000 }).notNull(),
    creationTime: time("creation_time", { withTimezone: true }).defaultNow().notNull(),
    userId: integer("user_id_fk").references(() => userModel.id),
    interval: intervalEnum().notNull(),
    priorityType: priorityEnum("priority_type").default("normal").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
})

export const activityLogModel = pgTable("activity_logs", {
    id: serial().primaryKey(),
    userId: integer("user_id_fk").references(() => userModel.id),
    taskId: integer("task_id_fk").references(() => taskModel.id),
    actionType: actionEnum("action_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// Types
export type User = InferModel<typeof userModel>
// export type Department = InferModel<typeof departments>
export type Task = InferModel<typeof taskModel>
export type Cronjob = InferModel<typeof cronjobModel>
export type ActivityLog = InferModel<typeof activityLogModel>

