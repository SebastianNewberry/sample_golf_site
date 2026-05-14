CREATE TABLE "series_slot_enrollment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_session_id" uuid NOT NULL,
	"slot_date" text NOT NULL,
	"slot_start_time" text NOT NULL,
	"slot_end_time" text NOT NULL,
	"adult_registration_id" uuid,
	"junior_program_registration_id" uuid,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "program" ADD COLUMN "series_capacity_per_slot" integer;--> statement-breakpoint
ALTER TABLE "series_slot_enrollment" ADD CONSTRAINT "series_slot_enrollment_program_session_id_program_session_id_fk" FOREIGN KEY ("program_session_id") REFERENCES "public"."program_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_slot_enrollment" ADD CONSTRAINT "series_slot_enrollment_adult_registration_id_adult_registration_id_fk" FOREIGN KEY ("adult_registration_id") REFERENCES "public"."adult_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_slot_enrollment" ADD CONSTRAINT "series_slot_enrollment_junior_program_registration_id_junior_program_registration_id_fk" FOREIGN KEY ("junior_program_registration_id") REFERENCES "public"."junior_program_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "series_slot_enrollment_session_idx" ON "series_slot_enrollment" USING btree ("program_session_id");--> statement-breakpoint
CREATE INDEX "series_slot_enrollment_slot_idx" ON "series_slot_enrollment" USING btree ("program_session_id","slot_date","slot_start_time");