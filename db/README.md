# Database Setup - Drizzle ORM with Neon PostgreSQL

This directory contains the database schema and configuration for Toski Golf Academy using Drizzle ORM and Neon PostgreSQL.

## Files

- `schema.ts` - Database schema definitions (better-auth compatible + app tables)
- `index.ts` - Database connection instance
- `README.md` - This file

## Database Tables

### better-auth Required Tables
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth provider accounts (optional)
- `verification` - Email verification and password reset tokens (optional)

### Application Tables
- `lesson` - Golf lessons/instruction sessions
- `booking` - Lesson bookings

## Setup Instructions

### 1. Create a Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new PostgreSQL database
3. Copy your connection string

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your Neon connection string:

```
DATABASE_URL=postgresql://user:password@ep-cool-region-123456.aws.neon.tech/neondb?sslmode=require
```

Update `BETTER_AUTH_SECRET` with a secure random string (you can generate one with `openssl rand -base64 32` on Linux/Mac or similar tools).

### 3. Run Migrations

Generate migration files:

```bash
npm run db:generate
```

Push schema to database (simple method for development):

```bash
npm run db:push
```

Or use migrations for production:

```bash
npm run db:migrate
```

### 4. Verify Database (Optional)

Open Drizzle Studio to browse your database:

```bash
npm run db:studio
```

## Usage

Import the database instance in your server components or API routes:

```typescript
import { db } from "@/db";
import { user, lesson, booking } from "@/db/schema";

// Example: Get all users
const users = await db.select().from(user);

// Example: Create a new booking
const newBooking = await db.insert(booking).values({
  userId: "user-id",
  lessonId: "lesson-id",
  scheduledAt: new Date(),
  status: "pending"
}).returning();
```

## Schema Details

### better-auth Tables
All required tables follow the better-auth schema guidelines:

- **user**: Stores user credentials and profile information
- **session**: Manages active user sessions
- **account**: Links users to OAuth providers (Google, GitHub, etc.)
- **verification**: Handles email verification and password resets

### Relations
The schema includes proper foreign key relationships:
- Users → Sessions (one-to-many)
- Users → Accounts (one-to-many)
- Users → Lessons (one-to-many as instructors)
- Users → Bookings (one-to-many)
- Lessons → Bookings (one-to-many)

## Notes

- The database is configured for Neon's serverless PostgreSQL
- All timestamps use PostgreSQL's native `timestamp` type
- Foreign keys include cascade deletes where appropriate
- The schema is designed to work seamlessly with better-auth

## Troubleshooting

### Connection Issues
- Ensure your `.env` file exists and has the correct `DATABASE_URL`
- Verify your Neon database is running
- Check that SSL is enabled in your connection string

### Migration Issues
- Make sure you have the latest packages: `npm install`
- Check that `drizzle.config.ts` has the correct schema path
- Ensure environment variables are loaded before running migration commands

