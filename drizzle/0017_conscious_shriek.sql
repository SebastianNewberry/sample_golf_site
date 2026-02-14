ALTER TABLE "adult_registration" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "refund_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "junior_program_registration" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "junior_program_registration" ADD COLUMN "refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "junior_program_registration" ADD COLUMN "refund_amount" numeric(10, 2);