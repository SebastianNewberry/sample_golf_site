CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"student_name" text NOT NULL,
	"user_id" uuid,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"notes" text,
	"google_calendar_event_id" text,
	"google_calendar_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_regular_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."regular_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_user_id_idx" ON "booking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_start_time_idx" ON "booking" USING btree ("start_time");