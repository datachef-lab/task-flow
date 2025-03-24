CREATE TYPE "public"."action_type" AS ENUM('create', 'update', 'delete', 'completed');--> statement-breakpoint
CREATE TYPE "public"."interval_type" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'half_yearly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."priority_type" AS ENUM('normal', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id_fk" integer,
	"task_id_fk" integer,
	"action_type" "action_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cronjobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_description" varchar(2000) NOT NULL,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"user_id_fk" integer,
	"interval" interval_type NOT NULL,
	"priority_type" "priority_type" DEFAULT 'normal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"abbreviation" varchar(255) NOT NULL,
	"description" varchar(2000) NOT NULL,
	"assigned_user_id_fk" integer,
	"created_user_id_fk" integer,
	"due_date" date DEFAULT '2025-03-22' NOT NULL,
	"priority_type" "priority_type" DEFAULT 'normal' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tasks_abbreviation_unique" UNIQUE("abbreviation")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"whatsapp_number" varchar(255) NOT NULL,
	"is_admin" boolean DEFAULT false,
	"disabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fk_users_id_fk" FOREIGN KEY ("user_id_fk") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_task_id_fk_tasks_id_fk" FOREIGN KEY ("task_id_fk") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cronjobs" ADD CONSTRAINT "cronjobs_user_id_fk_users_id_fk" FOREIGN KEY ("user_id_fk") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_user_id_fk_users_id_fk" FOREIGN KEY ("assigned_user_id_fk") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_user_id_fk_users_id_fk" FOREIGN KEY ("created_user_id_fk") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;