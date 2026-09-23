import { getPrivateInstructionSlots } from "@/db/queries/private-instruction";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/programs/private-availability?type=adult|junior
 * Open times for a private instruction page. Loaded when that page is opened.
 */
export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  if (type !== "adult" && type !== "junior") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const slots = await getPrivateInstructionSlots(type);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching private instruction times:", error);
    return NextResponse.json(
      { error: "Failed to load private instruction times" },
      { status: 500 },
    );
  }
}
