ALTER TABLE "tasks" ADD COLUMN "status" "task_status_type";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "remarks" varchar(500);--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "status";