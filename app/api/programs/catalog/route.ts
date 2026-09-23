import { getProgramPageCatalog } from "@/db/queries/programs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/programs/catalog
 * One payload for every program page. Private-instruction open times are omitted.
 */
export async function GET() {
  try {
    const programs = await getProgramPageCatalog();
    return NextResponse.json({ programs });
  } catch (error) {
    console.error("Error fetching program catalog:", error);
    return NextResponse.json(
      { error: "Failed to load programs" },
      { status: 500 },
    );
  }
}
