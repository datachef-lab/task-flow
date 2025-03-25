CREATE TYPE "public"."task_status_type" AS ENUM('completed', 'on_hold', 'request_date_extension');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "task_status_type";