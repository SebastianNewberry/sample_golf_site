import "server-only";

import stripe from "@/lib/stripe";

export const ACADEMY_TAX_ADDRESS = {
  line1: "141 South Opdyke Rd",
  city: "Auburn Hills",
  state: "MI",
  postal_code: "48326",
  country: "US",
} as const;

export function isSalesTaxInclusive(): boolean {
  const value = process.env.SALES_TAX_INCLUSIVE;
  if (value === undefined || value === "") return true;
  return value !== "false" && value !== "0";
}

function fallbackMichiganTax(amountCents: number, inclusive: boolean) {
  if (amountCents <= 0) return { taxCents: 0, totalCents: 0 };
  if (inclusive) {
    const preTax = Math.round(amountCents / 1.06);
    return { taxCents: amountCents - preTax, totalCents: amountCents };
  }
  const taxCents = Math.round(amountCents * 0.06);
  return { taxCents, totalCents: amountCents + taxCents };
}

export async function calculateSalesTax(params: {
  amountCents: number;
  reference: string;
}): Promise<{
  taxCents: number;
  totalCents: number;
  calculationId?: string;
  inclusive: boolean;
}> {
  const inclusive = isSalesTaxInclusive();
  if (params.amountCents <= 0) {
    return { taxCents: 0, totalCents: 0, inclusive };
  }

  try {
    const calculation = await stripe.tax.calculations.create({
      currency: "usd",
      line_items: [
        {
          amount: params.amountCents,
          reference: params.reference,
          tax_behavior: inclusive ? "inclusive" : "exclusive",
        },
      ],
      customer_details: {
        address: ACADEMY_TAX_ADDRESS,
        address_source: "shipping",
      },
    });

    const taxCents = inclusive
      ? calculation.tax_amount_inclusive
      : calculation.tax_amount_exclusive;

    return {
      taxCents,
      totalCents: calculation.amount_total,
      calculationId: calculation.id,
      inclusive,
    };
  } catch (error) {
    console.error(
      "Stripe Tax calculation failed, using Michigan 6% fallback",
      error,
    );
    const fallback = fallbackMichiganTax(params.amountCents, inclusive);
    return { ...fallback, inclusive };
  }
}
