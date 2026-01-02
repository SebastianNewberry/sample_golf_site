import { db } from "@/db";
import { program, programSession } from "@/db/schema";
import { eq } from "drizzle-orm";

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

// Get a program by category and optional level
export async function getProgramByCategory(
  category: string,
  level?: string | null
) {
  const results = await db.select().from(program).where(eq(program.category, category));
  
  if (level) {
    return results.find((p) => p.level === level) || null;
  }
  
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
  category: string;
  level?: string | null;
  price: string;
  duration: string;
  capacity?: number;
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
      category: data.category,
      level: data.level,
      price: data.price,
      duration: data.duration,
      capacity: data.capacity ?? 6,
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
    category: string;
    level: string | null;
    price: string;
    duration: string;
    capacity: number;
    imageUrl: string | null;
    features: string[];
    details: string; // JSON string of ProgramDetail[]
  }>
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

