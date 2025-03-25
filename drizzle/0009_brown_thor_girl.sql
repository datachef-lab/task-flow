ALTER TABLE "tasks" ADD COLUMN "requested_date" date DEFAULT now();--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "request_date_extension_reason" varchar(2000);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "is_request_date_extension_approved" boolean;