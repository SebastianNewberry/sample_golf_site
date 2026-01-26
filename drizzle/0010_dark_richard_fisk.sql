DROP INDEX "instructor_availability_day_idx";--> statement-breakpoint
ALTER TABLE "instructor_availability" ADD COLUMN "schedule" json;--> statement-breakpoint
ALTER TABLE "instructor_availability" ADD COLUMN "google_calendar_id" text;--> statement-breakpoint
ALTER TABLE "instructor_availability" ADD COLUMN "sync_with_google_calendar" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "instructor_availability_type_idx" ON "instructor_availability" USING btree ("type");--> statement-breakpoint
ALTER TABLE "instructor_availability" DROP COLUMN "day_of_week";--> statement-breakpoint
ALTER TABLE "instructor_availability" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "instructor_availability" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "instructor_availability" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "instructor_availability" DROP COLUMN "google_calendar_event_id";