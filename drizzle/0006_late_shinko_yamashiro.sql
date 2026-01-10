ALTER TABLE "adult_registration" ADD COLUMN "first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "phone_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "junior_registration" ADD COLUMN "primary_contact_first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "junior_registration" ADD COLUMN "primary_contact_last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "junior_registration" ADD COLUMN "primary_contact_email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "junior_registration" ADD COLUMN "primary_contact_phone" text NOT NULL;