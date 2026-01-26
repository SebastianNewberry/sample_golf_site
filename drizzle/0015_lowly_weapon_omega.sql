ALTER TABLE "adult_registration" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "junior_program_registration" ADD COLUMN "expires_at" timestamp;