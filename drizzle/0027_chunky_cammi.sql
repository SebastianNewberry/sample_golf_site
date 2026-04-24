CREATE TABLE "gift_card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"initial_amount" numeric(10, 2) NOT NULL,
	"current_balance" numeric(10, 2) NOT NULL,
	"purchaser_email" text NOT NULL,
	"purchaser_name" text NOT NULL,
	"recipient_email" text,
	"stripe_payment_intent_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gift_card_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "promo_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX "gift_card_code_idx" ON "gift_card" USING btree ("code");--> statement-breakpoint
CREATE INDEX "gift_card_purchaser_email_idx" ON "gift_card" USING btree ("purchaser_email");--> statement-breakpoint
CREATE INDEX "gift_card_payment_intent_idx" ON "gift_card" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "promo_code_code_idx" ON "promo_code" USING btree ("code");