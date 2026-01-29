import "server-only";

import { db } from "@/db";
import {
  program,
  programSession,
  instructorAvailability,
  adultRegistration,
  juniorProgramRegistration,
} from "@/db/schema";
import { eq, or, like, and, gt, count } from "drizzle-orm";

// Get all programs with their sessions
export async function getProgramsWithSessions(type: "adult" | "junior") {
  const programs = await db
    .select()
    .from(program)
    .where(eq(program.type, type));

  const programsWithSessions = await Promise.all(
    programs.map(async (p) => {
      const sessions = await db
        .select()
        .from(programSession)
        .where(eq(programSession.programId, p.id));

      return {
        ...p,
        sessions,
      };
    }),
  );

  return programsWithSessions;
}

// Get all programs
export async function getAllPrograms() {
  return await db.select().from(program);
}

// Get programs by type (adult or junior)
export async function getProgramsByType(type: "adult" | "junior") {
  return await db.select().from(program).where(eq(program.type, type));
}

// Get a single program by ID
export async function getProgramById(id: string) {
  const results = await db.select().from(program).where(eq(program.id, id));
  return results[0] || null;
}

// Get a program by name (case-insensitive)
export async function getProgramByName(name: string) {
  const results = await db
    .select()
    .from(program)
    .where(like(program.name, name));
  return results[0] || null;
}

// Get a program with its sessions
export async function getProgramWithSessions(programId: string) {
  const programData = await getProgramById(programId);

  if (!programData) {
    return null;
  }

  const sessions = await db
    .select()
    .from(programSession)
    .where(eq(programSession.programId, programId));

  return {
    ...programData,
    sessions,
  };
}

// Get sessions for a program
export async function getProgramSessions(programId: string) {
  return await db
    .select()
    .from(programSession)
    .where(eq(programSession.programId, programId));
}

// Create a new program
export async function createProgram(data: {
  name: string;
  description: string;
  type: "adult" | "junior";
  price: string;
  duration: string;
  imageUrl?: string | null;
  features?: string[];
  details?: string; // JSON string of ProgramDetail[]
}) {
  const result = await db
    .insert(program)
    .values({
      name: data.name,
      description: data.description,
      type: data.type,
      price: data.price,
      duration: data.duration,
      imageUrl: data.imageUrl,
      features: data.features,
      details: data.details,
    })
    .returning();

  return result[0];
}

// Create a program session
export async function createProgramSession(data: {
  programId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  schedule?: string; // JSON string of SessionSchedule
  capacity: number;
  isActive?: boolean;
}) {
  const result = await db
    .insert(programSession)
    .values({
      programId: data.programId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      schedule: data.schedule,
      capacity: data.capacity,
      isActive: data.isActive ?? true,
    })
    .returning();

  return result[0];
}

// Update a program
export async function updateProgram(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    type: "adult" | "junior";
    price: string;
    duration: string;
    imageUrl: string | null;
    features: string[];
    details: string; // JSON string of ProgramDetail[]
  }>,
) {
  const result = await db
    .update(program)
    .set(data)
    .where(eq(program.id, id))
    .returning();

  return result[0];
}

// Delete a program
export async function deleteProgram(id: string) {
  await db.delete(program).where(eq(program.id, id));
}

// Get active instructor availability rules by type
export async function getInstructorAvailability(type: "adult" | "junior") {
  return await db
    .select()
    .from(instructorAvailability)
    .where(eq(instructorAvailability.type, type));
}
// Check availability for a program session including pending holds
export async function checkProgramSessionCapacity(sessionId: string) {
  const session = await db.query.programSession.findFirst({
    where: eq(programSession.id, sessionId),
    with: {
      program: true,
    },
  });

  if (!session) {
    return { available: false, remaining: 0, error: "Session not found" };
  }

  const now = new Date();
  let currentCount = 0;

  // Logic: Count confirmed (paid) OR (pending AND not expired)
  const activeHoldRule = (table: any) =>
    or(
      eq(table.paymentStatus, "paid"),
      and(eq(table.paymentStatus, "pending"), gt(table.expiresAt, now)),
    );

  if (session.program.type === "adult") {
    const [result] = await db
      .select({ count: count() })
      .from(adultRegistration)
      .where(
        and(
          eq(adultRegistration.programSessionId, sessionId),
          activeHoldRule(adultRegistration),
        ),
      );
    currentCount = result.count;
  } else {
    const [result] = await db
      .select({ count: count() })
      .from(juniorProgramRegistration)
      .where(
        and(
          eq(juniorProgramRegistration.programSessionId, sessionId),
          activeHoldRule(juniorProgramRegistration),
        ),
      );
    currentCount = result.count;
  }

  return {
    available: currentCount < session.capacity,
    remaining: session.capacity - currentCount,
  };
}