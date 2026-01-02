ALTER TABLE "program" ALTER COLUMN "details" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "program" DROP COLUMN "equipment_included";--> statement-breakpoint
ALTER TABLE "program" DROP COLUMN "practice_balls_included";--> statement-breakpoint
ALTER TABLE "program" DROP COLUMN "green_fees_included";