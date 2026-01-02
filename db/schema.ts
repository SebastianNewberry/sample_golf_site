import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { decimal } from "drizzle-orm/pg-core";

export const regularUser = pgTable(
  "regular_user",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    phoneNumber: text("phone_number").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const regularUserRelations = relations(regularUser, ({ many }) => ({
  adultRegistrations: many(adultRegistration),
  juniorRegistrations: many(juniorRegistration),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Golf Programs
export const program = pgTable("program", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'adult' or 'junior'
  category: text("category").notNull(), // e.g., 'get-golf-ready', 'short-game', etc.
  level: text("level"), // e.g., 'Level I', 'Level II', optional
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: text("duration").notNull(), // e.g., 'Five 1-hour range sessions'
  capacity: integer("capacity").notNull().default(6), // max number of students per session
  imageUrl: text("image_url"),
  features: text("features").array(), // array of feature strings
  /**
   * JSON string containing structured program details.
   * Format: Array of { type: ProgramDetailType, descriptions: string[] }
   * Example: [{"type":"all-inclusive","descriptions":["Practice balls included","Equipment provided"]}]
   * See lib/program-details.ts for available detail types and their icons.
   */
  details: text("details"), // JSON string of structured details
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const programSession = pgTable(
  "program_session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g., "Session 1: April 2025"
    startDate: timestamp("start_date").notNull(), // When the session series starts
    endDate: timestamp("end_date").notNull(), // When the session series ends
    /**
     * JSON string defining the recurring schedule.
     * Format: { daysOfWeek: number[], startTime: string, endTime: string }
     * - daysOfWeek: Array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
     * - startTime: Time in 24h format "HH:MM" (e.g., "09:00")
     * - endTime: Time in 24h format "HH:MM" (e.g., "10:00")
     * Example: {"daysOfWeek":[2,4],"startTime":"18:00","endTime":"19:00"} = Tue/Thu 6-7pm
     */
    schedule: text("schedule"), // JSON string for recurring schedule
    capacity: integer("capacity").notNull(),
    enrolledCount: integer("enrolled_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("program_session_program_id_idx").on(table.programId)]
);

// Adult Program Registration
export const adultRegistration = pgTable(
  "adult_registration",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => regularUser.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    programSessionId: uuid("program_session_id").references(
      () => programSession.id,
      { onDelete: "set null" }
    ),
    additionalComments: text("additional_comments"), // Optional additional comments from user

    // Payment fields
    // Unique constraint prevents duplicate webhook processing
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(), // Stripe payment intent ID
    stripeCustomerId: text("stripe_customer_id"), // Stripe customer ID
    paymentStatus: text("payment_status").notNull().default("pending"), // 'pending', 'paid', 'failed', 'cancelled'
    paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }), // Amount paid

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("adult_registration_user_id_idx").on(table.userId),
    index("adult_registration_program_id_idx").on(table.programId),
    index("adult_registration_payment_intent_idx").on(
      table.stripePaymentIntentId
    ),
  ]
);

// Junior Program Registration Form Data
export const juniorRegistration = pgTable(
  "junior_registration",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => regularUser.id, { onDelete: "cascade" }),

    // Contact preferences
    phoneType: text("phone_type").notNull(), // 'mobile', 'home', 'work'
    preferredContactMethod: text("preferred_contact_method").notNull(), // 'text', 'email'

    // Child Information
    childFirstName: text("child_first_name").notNull(),
    childLastName: text("child_last_name").notNull(),
    childAge: integer("child_age").notNull(),
    childExperienceLevel: text("child_experience_level").notNull(), // e.g., "1 - No Experience"
    hasOwnClubs: boolean("has_own_clubs").notNull().default(false),
    friendsToGroupWith: text("friends_to_group_with"), // Optional - comma separated names
    additionalComments: text("additional_comments"), // Optional additional comments from parent

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("junior_registration_user_id_idx").on(table.userId)]
);

// Link junior registrations to specific programs
export const juniorProgramRegistration = pgTable(
  "junior_program_registration",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    juniorRegistrationId: uuid("junior_registration_id")
      .notNull()
      .references(() => juniorRegistration.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    programSessionId: uuid("program_session_id").references(
      () => programSession.id,
      { onDelete: "set null" }
    ),

    // Payment fields
    // Unique constraint prevents duplicate webhook processing
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(), // Stripe payment intent ID
    stripeCustomerId: text("stripe_customer_id"), // Stripe customer ID
    paymentStatus: text("payment_status").notNull().default("pending"), // 'pending', 'paid', 'failed', 'cancelled'
    paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }), // Amount paid

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("junior_program_registration_junior_reg_id_idx").on(
      table.juniorRegistrationId
    ),
    index("junior_program_registration_program_id_idx").on(table.programId),
    index("junior_program_registration_payment_intent_idx").on(
      table.stripePaymentIntentId
    ),
  ]
);

// Relations
import { relations } from "drizzle-orm";

export const programRelations = relations(program, ({ many }) => ({
  sessions: many(programSession),
  adultRegistrations: many(adultRegistration),
}));

export const programSessionRelations = relations(
  programSession,
  ({ one, many }) => ({
    program: one(program, {
      fields: [programSession.programId],
      references: [program.id],
    }),
    adultRegistrations: many(adultRegistration),
    juniorProgramRegistrations: many(juniorProgramRegistration),
  })
);

export const adultRegistrationRelations = relations(
  adultRegistration,
  ({ one }) => ({
    user: one(regularUser, {
      fields: [adultRegistration.userId],
      references: [regularUser.id],
    }),
    program: one(program, {
      fields: [adultRegistration.programId],
      references: [program.id],
    }),
    programSession: one(programSession, {
      fields: [adultRegistration.programSessionId],
      references: [programSession.id],
    }),
  })
);

export const juniorRegistrationRelations = relations(
  juniorRegistration,
  ({ one, many }) => ({
    user: one(regularUser, {
      fields: [juniorRegistration.userId],
      references: [regularUser.id],
    }),
    programRegistrations: many(juniorProgramRegistration),
  })
);

export const juniorProgramRegistrationRelations = relations(
  juniorProgramRegistration,
  ({ one }) => ({
    juniorRegistration: one(juniorRegistration, {
      fields: [juniorProgramRegistration.juniorRegistrationId],
      references: [juniorRegistration.id],
    }),
    program: one(program, {
      fields: [juniorProgramRegistration.programId],
      references: [program.id],
    }),
    programSession: one(programSession, {
      fields: [juniorProgramRegistration.programSessionId],
      references: [programSession.id],
    }),
  })
);

// ============================================
// CART SYSTEM
// ============================================

/**
 * Cart - stores cart metadata
 * Uses a session-based approach with a unique cart ID stored in cookies
 * No authentication required - guests can have carts
 */
export const cart = pgTable(
  "cart",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Optional user ID if they're logged in (for future use)
    userId: uuid("user_id").references(() => regularUser.id, {
      onDelete: "set null",
    }),
    // Session identifier for guest carts
    sessionId: text("session_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    // Cart expires after 30 days of inactivity
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [
    index("cart_session_id_idx").on(table.sessionId),
    index("cart_user_id_idx").on(table.userId),
  ]
);

/**
 * Cart Item - individual programs added to cart
 * Stores minimal info - form data is collected at checkout
 */
export const cartItem = pgTable(
  "cart_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => cart.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    programSessionId: uuid("program_session_id").references(
      () => programSession.id,
      { onDelete: "set null" }
    ),
    // Type of registration - determines which form to show at checkout
    registrationType: text("registration_type").notNull(), // 'adult' or 'junior'
    // Quantity (usually 1 for programs, but could support multiples)
    quantity: integer("quantity").notNull().default(1),
    // Price at time of adding to cart (in case price changes)
    priceAtAdd: decimal("price_at_add", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("cart_item_cart_id_idx").on(table.cartId),
    index("cart_item_program_id_idx").on(table.programId),
  ]
);

// Checkout Session - stores form data temporarily until payment completes
export const checkoutSession = pgTable(
  "checkout_session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    checkoutId: text("checkout_id").notNull().unique(), // UUID used to identify checkout
    cartId: uuid("cart_id")
      .notNull()
      .references(() => cart.id, { onDelete: "cascade" }),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    // Store form data as JSON
    formData: text("form_data").notNull(), // JSON string of all form data
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: text("status").notNull().default("pending"), // 'pending', 'completed', 'expired'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(), // Expire after 1 hour
  },
  (table) => [
    index("checkout_session_checkout_id_idx").on(table.checkoutId),
    index("checkout_session_payment_intent_idx").on(
      table.stripePaymentIntentId
    ),
  ]
);

// Cart Relations
export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(regularUser, {
    fields: [cart.userId],
    references: [regularUser.id],
  }),
  items: many(cartItem),
  checkoutSessions: many(checkoutSession),
}));

export const checkoutSessionRelations = relations(
  checkoutSession,
  ({ one }) => ({
    cart: one(cart, {
      fields: [checkoutSession.cartId],
      references: [cart.id],
    }),
  })
);

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart, {
    fields: [cartItem.cartId],
    references: [cart.id],
  }),
  program: one(program, {
    fields: [cartItem.programId],
    references: [program.id],
  }),
  programSession: one(programSession, {
    fields: [cartItem.programSessionId],
    references: [programSession.id],
  }),
}));

// Type exports
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type RegularUser = typeof regularUser.$inferSelect;
export type NewRegularUser = typeof regularUser.$inferInsert;
export type Program = typeof program.$inferSelect;
export type NewProgram = typeof program.$inferInsert;
export type ProgramSession = typeof programSession.$inferSelect;
export type NewProgramSession = typeof programSession.$inferInsert;
export type AdultRegistration = typeof adultRegistration.$inferSelect;
export type NewAdultRegistration = typeof adultRegistration.$inferInsert;
export type JuniorRegistration = typeof juniorRegistration.$inferSelect;
export type NewJuniorRegistration = typeof juniorRegistration.$inferInsert;
export type JuniorProgramRegistration =
  typeof juniorProgramRegistration.$inferSelect;
export type NewJuniorProgramRegistration =
  typeof juniorProgramRegistration.$inferInsert;
export type Cart = typeof cart.$inferSelect;
export type NewCart = typeof cart.$inferInsert;
export type CartItem = typeof cartItem.$inferSelect;
export type NewCartItem = typeof cartItem.$inferInsert;
export type CheckoutSession = typeof checkoutSession.$inferSelect;
export type NewCheckoutSession = typeof checkoutSession.$inferInsert;
