ALTER TABLE "adult_registration" ALTER COLUMN "program_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "booking_id" uuid;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "phone_type" text;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "preferred_contact_method" text;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD COLUMN "has_own_clubs" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "junior_registration" ADD COLUMN "booking_id" uuid;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD CONSTRAINT "adult_registration_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "junior_registration" ADD CONSTRAINT "junior_registration_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adult_registration_booking_id_idx" ON "adult_registration" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "junior_registration_booking_id_idx" ON "junior_registration" USING btree ("booking_id");