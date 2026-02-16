DROP TABLE "google_contacts_integration" CASCADE;--> statement-breakpoint
ALTER TABLE "booking_participant" ADD COLUMN "phone_type" text;--> statement-breakpoint
ALTER TABLE "booking_participant" ADD COLUMN "preferred_contact_method" text;--> statement-breakpoint
ALTER TABLE "booking_participant" ADD COLUMN "has_own_clubs" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "booking_participant" ADD COLUMN "friends_to_group_with" text;