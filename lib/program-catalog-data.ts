import type { Program, ProgramSession } from "@/db/schema";

export type ProgramCatalogSession = ProgramSession & {
  enrollmentCount: number;
  spotsRemaining: number;
  isBooked: boolean;
};

export type ProgramCatalogSlotEnrollment = {
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  enrolledCount: number;
};

/** Program page payload. Private-instruction open times are not included. */
export type ProgramCatalogRecord = {
  program: Program;
  sessions: ProgramCatalogSession[];
  slotEnrollment: Record<string, ProgramCatalogSlotEnrollment[]>;
  pricingOptions: unknown[];
};
