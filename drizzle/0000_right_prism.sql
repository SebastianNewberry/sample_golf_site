CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adult_registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"program_session_id" uuid,
	"additional_comments" text,
	"stripe_payment_intent_id" text,
	"stripe_customer_id" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "adult_registration_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"program_session_id" uuid,
	"registration_type" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_at_add" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkout_id" text NOT NULL,
	"cart_id" uuid NOT NULL,
	"stripe_payment_intent_id" text,
	"form_data" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "checkout_session_checkout_id_unique" UNIQUE("checkout_id")
);
--> statement-breakpoint
CREATE TABLE "junior_program_registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"junior_registration_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"program_session_id" uuid,
	"stripe_payment_intent_id" text,
	"stripe_customer_id" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "junior_program_registration_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "junior_registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone_type" text NOT NULL,
	"preferred_contact_method" text NOT NULL,
	"child_first_name" text NOT NULL,
	"child_last_name" text NOT NULL,
	"child_age" integer NOT NULL,
	"child_experience_level" text NOT NULL,
	"has_own_clubs" boolean DEFAULT false NOT NULL,
	"friends_to_group_with" text,
	"additional_comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"level" text,
	"price" numeric(10, 2) NOT NULL,
	"duration" text NOT NULL,
	"capacity" integer DEFAULT 6 NOT NULL,
	"equipment_included" boolean DEFAULT true,
	"practice_balls_included" boolean DEFAULT true,
	"green_fees_included" boolean DEFAULT true,
	"image_url" text,
	"features" text[],
	"details" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"capacity" integer NOT NULL,
	"enrolled_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regular_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regular_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD CONSTRAINT "adult_registration_user_id_regular_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."regular_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD CONSTRAINT "adult_registration_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adult_registration" ADD CONSTRAINT "adult_registration_program_session_id_program_session_id_fk" FOREIGN KEY ("program_session_id") REFERENCES "public"."program_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_regular_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."regular_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_program_session_id_program_session_id_fk" FOREIGN KEY ("program_session_id") REFERENCES "public"."program_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_session" ADD CONSTRAINT "checkout_session_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "junior_program_registration" ADD CONSTRAINT "junior_program_registration_junior_registration_id_junior_registration_id_fk" FOREIGN KEY ("junior_registration_id") REFERENCES "public"."junior_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "junior_program_registration" ADD CONSTRAINT "junior_program_registration_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "junior_program_registration" ADD CONSTRAINT "junior_program_registration_program_session_id_program_session_id_fk" FOREIGN KEY ("program_session_id") REFERENCES "public"."program_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "junior_registration" ADD CONSTRAINT "junior_registration_user_id_regular_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."regular_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_session" ADD CONSTRAINT "program_session_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "adult_registration_user_id_idx" ON "adult_registration" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "adult_registration_program_id_idx" ON "adult_registration" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "adult_registration_payment_intent_idx" ON "adult_registration" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "cart_session_id_idx" ON "cart" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "cart_user_id_idx" ON "cart" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cart_item_cart_id_idx" ON "cart_item" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_item_program_id_idx" ON "cart_item" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "checkout_session_checkout_id_idx" ON "checkout_session" USING btree ("checkout_id");--> statement-breakpoint
CREATE INDEX "checkout_session_payment_intent_idx" ON "checkout_session" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "junior_program_registration_junior_reg_id_idx" ON "junior_program_registration" USING btree ("junior_registration_id");--> statement-breakpoint
CREATE INDEX "junior_program_registration_program_id_idx" ON "junior_program_registration" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "junior_program_registration_payment_intent_idx" ON "junior_program_registration" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "junior_registration_user_id_idx" ON "junior_registration" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "program_session_program_id_idx" ON "program_session" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "regular_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");