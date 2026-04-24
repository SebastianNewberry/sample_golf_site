import "server-only";

import { getAllPrograms } from "@/db/queries/programs";
import { NextResponse } from "next/server";

/**
 * GET /api/gift-cards/programs
 * Returns active programs with their prices for the gift card purchase page
 */
export async function GET() {
  try {
    const programs = await getAllPrograms();
    const activePrograms = programs
      .filter((p) => p.isActive)
      .map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        price: p.price,
        description: p.description,
        pricingOptions: p.pricingOptions,
      }))
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    return NextResponse.json(activePrograms);
  } catch (error) {
    console.error("Error fetching programs for gift cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 },
    );
  }
}
