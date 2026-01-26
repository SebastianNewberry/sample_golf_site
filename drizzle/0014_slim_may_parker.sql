ALTER TABLE "booking_participant" ADD COLUMN "parent_name" text;--> statement-breakpoint
ALTER TABLE "booking_participant" ADD COLUMN "parent_email" text;--> statement-breakpoint
ALTER TABLE "booking_participant" ADD COLUMN "parent_phone" text;--> statement-breakpoint
ALTER TABLE "booking_participant" ADD COLUMN "child_age" integer;--> statement-breakpoint
ALTER TABLE "booking_participant" ADD COLUMN "child_experience" text;--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "student_name";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "student_email";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "student_phone";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "parent_name";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "parent_email";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "parent_phone";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "child_age";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "child_experience";