ALTER TABLE "tasks" ALTER COLUMN "due_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "due_date" DROP NOT NULL;