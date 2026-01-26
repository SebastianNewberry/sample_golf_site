CREATE TABLE "instructor_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "program" ADD COLUMN "scheduling_type" text DEFAULT 'session' NOT NULL;--> statement-breakpoint
CREATE INDEX "instructor_availability_day_idx" ON "instructor_availability" USING btree ("day_of_week");