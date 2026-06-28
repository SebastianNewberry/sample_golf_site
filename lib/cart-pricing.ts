/**
 * Server-side cart item price resolution and reconciliation.
 */

import { getProgramById } from "@/db/queries/programs";
import { updateCartItemPrice } from "@/db/queries/cart";

export interface PricingOption {
  id: string;
  price: number | string;
  playersCount?: number;
}

export interface CartItemForPricing {
  id: string;
  cartId: string;
  programId: string;
  programSessionId?: string | null;
  quantity: number;
  priceAtAdd: string;
  metadata?: string | null;
  program?: {
    id: string;
    name: string;
    type?: string;
    price?: string;
    schedulingType?: string;
    pricingOptions?: unknown;
  } | null;
}

export interface ResolvedCartPrice {
  priceAtAdd: string;
  error?: string;
}

export interface PriceUpdate {
  itemId: string;
  programName: string;
  oldPrice: string;
  newPrice: string;
}

export interface ReconcileResult {
  priceUpdates: PriceUpdate[];
  errors: Record<string, string>;
}

function parsePricingOptions(pricingOptions: unknown): PricingOption[] {
  if (!pricingOptions) return [];
  try {
    const parsed =
      typeof pricingOptions === "string"
        ? JSON.parse(pricingOptions)
        : pricingOptions;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isPackagePricingProgram(program: {
  schedulingType?: string | null;
  type?: string | null;
  pricingOptions?: unknown;
}): boolean {
  return (
    program.schedulingType === "appointment" ||
    program.schedulingType === "series" ||
    program.type === "private" ||
    program.type === "junior_private" ||
    parsePricingOptions(program.pricingOptions).length > 0
  );
}

function roundCents(price: number): number {
  return Math.round(price * 100);
}

/**
 * Resolve authoritative per-unit priceAtAdd for a cart item from current program data.
 */
export function resolveCartItemPrice(
  program: {
    id: string;
    price: string;
    schedulingType?: string | null;
    type?: string | null;
    pricingOptions?: unknown;
  },
  item: Pick<CartItemForPricing, "metadata" | "quantity">,
): ResolvedCartPrice {
  if (!isPackagePricingProgram(program)) {
    return { priceAtAdd: Number(program.price).toFixed(2) };
  }

  const options = parsePricingOptions(program.pricingOptions);
  if (options.length === 0) {
    return { priceAtAdd: Number(program.price).toFixed(2) };
  }

  let metadataObj: { packageId?: string } = {};
  if (item.metadata) {
    try {
      metadataObj = JSON.parse(item.metadata);
    } catch {
      return { priceAtAdd: "", error: "Invalid item metadata." };
    }
  }

  const packageId = metadataObj.packageId;
  const matchedOption = packageId
    ? options.find((o) => o.id === packageId)
    : null;

  if (!matchedOption) {
    return {
      priceAtAdd: "",
      error: "The selected pricing package is no longer available.",
    };
  }

  const packagePrice = Number(matchedOption.price);
  const basePlayersCount = Number(matchedOption.playersCount) || 1;

  // Series stores full package price; private instruction stores per-player price.
  if (program.schedulingType === "series") {
    return { priceAtAdd: packagePrice.toFixed(2) };
  }

  const perPlayerPrice =
    Math.round((packagePrice / basePlayersCount) * 100) / 100;
  return { priceAtAdd: perPlayerPrice.toFixed(2) };
}

/**
 * Reconcile all cart item prices against current program data.
 */
export async function reconcileCartPricing(
  items: CartItemForPricing[],
): Promise<ReconcileResult> {
  const priceUpdates: PriceUpdate[] = [];
  const errors: Record<string, string> = {};

  const programCache = new Map<string, Awaited<ReturnType<typeof getProgramById>>>();

  for (const item of items) {
    let programData = programCache.get(item.programId);
    if (programData === undefined) {
      programData = await getProgramById(item.programId);
      programCache.set(item.programId, programData);
    }

    if (!programData) {
      errors[item.id] = "Program no longer exists.";
      continue;
    }

    const resolved = resolveCartItemPrice(programData, item);
    if (resolved.error) {
      errors[item.id] = resolved.error;
      continue;
    }

    const storedCents = roundCents(Number(item.priceAtAdd));
    const resolvedCents = roundCents(Number(resolved.priceAtAdd));

    if (storedCents !== resolvedCents) {
      await updateCartItemPrice(item.id, resolved.priceAtAdd);
      priceUpdates.push({
        itemId: item.id,
        programName: programData.name,
        oldPrice: Number(item.priceAtAdd).toFixed(2),
        newPrice: resolved.priceAtAdd,
      });
      item.priceAtAdd = resolved.priceAtAdd;
    }
  }

  return { priceUpdates, errors };
}
