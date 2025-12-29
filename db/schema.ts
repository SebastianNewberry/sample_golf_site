import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// User table - required by better-auth
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified"),
  name: text("name"),
  image: text("image"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Session table - required by better-auth
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Account table - for OAuth providers (optional, recommended by better-auth)
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'oauth' or 'oidc'
  provider: text("provider").notNull(), // e.g., 'google', 'github'
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Verification table - for email verification, password reset (optional)
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Additional application-specific tables for Toski Golf Academy

// Lesson table
export const lesson = pgTable("lesson", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in cents
  maxCapacity: integer("maxCapacity"),
  instructorId: text("instructorId").references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Booking table
export const booking = pgTable("booking", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  lessonId: text("lessonId")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: text("status").notNull(), // 'pending', 'confirmed', 'cancelled', 'completed'
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  lessons: many(lesson),
  bookings: many(booking),
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

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  instructor: one(user, {
    fields: [lesson.instructorId],
    references: [user.id],
  }),
  bookings: many(booking),
}));

export const bookingRelations = relations(booking, ({ one }) => ({
  user: one(user, {
    fields: [booking.userId],
    references: [user.id],
  }),
  lesson: one(lesson, {
    fields: [booking.lessonId],
    references: [lesson.id],
  }),
}));
