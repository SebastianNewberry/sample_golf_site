/**
 * Server-side cart item price resolution and reconciliation.
 */

import { getProgramById } from "@/db/queries/programs";
import {
  updateCartItemDetails,
  updateCartItemPrice,
} from "@/db/queries/cart";
import {
  applyPackageToMetadata,
  cartItemLineTotal,
  findOnCoursePackageForPlayers,
  getOnCoursePlayerRange,
  parseCartMetadata,
  parsePricingOptions,
  perPlayerUnitPrice,
  type PricingOption,
} from "@/lib/pricing-options";

export type { PricingOption };

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
  lineTotal: string;
  metadata?: string;
  packageSwitched?: boolean;
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

function findOptionById(
  options: PricingOption[],
  packageId: unknown,
): PricingOption | null {
  if (typeof packageId !== "string" || !packageId) return null;
  return options.find((option) => option.id === packageId) ?? null;
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
    const priceAtAdd = Number(program.price).toFixed(2);
    return {
      priceAtAdd,
      lineTotal: cartItemLineTotal({
        quantity: item.quantity,
        priceAtAdd,
        metadata: item.metadata,
      }).toFixed(2),
    };
  }

  const options = parsePricingOptions(program.pricingOptions);
  if (options.length === 0) {
    const priceAtAdd = Number(program.price).toFixed(2);
    return {
      priceAtAdd,
      lineTotal: cartItemLineTotal({
        quantity: item.quantity,
        priceAtAdd,
        metadata: item.metadata,
      }).toFixed(2),
    };
  }

  const metadataObj = parseCartMetadata(item.metadata);
  if (item.metadata && Object.keys(metadataObj).length === 0) {
    try {
      JSON.parse(item.metadata);
    } catch {
      return { priceAtAdd: "", lineTotal: "", error: "Invalid item metadata." };
    }
  }

  let matchedOption = findOptionById(options, metadataObj.packageId);

  if (!matchedOption) {
    return {
      priceAtAdd: "",
      lineTotal: "",
      error: "The selected pricing package is no longer available.",
    };
  }

  let packageSwitched = false;
  let nextMetadata: string | undefined;

  if (matchedOption.isOnCourse) {
    const resolved = findOnCoursePackageForPlayers(
      options,
      matchedOption,
      item.quantity,
    );
    if (!resolved) {
      const range = getOnCoursePlayerRange(options, matchedOption);
      return {
        priceAtAdd: "",
        lineTotal: "",
        error: range
          ? `On-course coaching is limited to ${range.max} player${range.max === 1 ? "" : "s"}.`
          : "No on-course package is available for this number of players.",
      };
    }

    packageSwitched = resolved.id !== matchedOption.id;
    matchedOption = resolved;
    nextMetadata = applyPackageToMetadata(item.metadata, matchedOption);
  }

  const packagePrice = Number(matchedOption.price);
  const basePlayersCount = Number(matchedOption.playersCount) || 1;

  if (program.schedulingType === "series") {
    return { priceAtAdd: packagePrice.toFixed(2), lineTotal: packagePrice.toFixed(2) };
  }

  const priceAtAdd = perPlayerUnitPrice(packagePrice, basePlayersCount);
  const metadataForTotal = nextMetadata ?? item.metadata;
  const lineTotal = matchedOption.isOnCourse
    ? packagePrice.toFixed(2)
    : cartItemLineTotal({
        quantity: item.quantity,
        priceAtAdd,
        metadata: metadataForTotal,
      }).toFixed(2);

  return {
    priceAtAdd,
    lineTotal,
    metadata: nextMetadata,
    packageSwitched,
  };
}

/**
 * Reconcile all cart item prices against current program data.
 */
export async function reconcileCartPricing(
  items: CartItemForPricing[],
): Promise<ReconcileResult> {
  const priceUpdates: PriceUpdate[] = [];
  const errors: Record<string, string> = {};

  const programCache = new Map<
    string,
    Awaited<ReturnType<typeof getProgramById>>
  >();

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
    const metadataChanged = Boolean(
      resolved.metadata && resolved.metadata !== item.metadata,
    );

    if (storedCents !== resolvedCents || metadataChanged) {
      if (metadataChanged && resolved.metadata) {
        await updateCartItemDetails(item.id, {
          priceAtAdd: resolved.priceAtAdd,
          metadata: resolved.metadata,
        });
        item.metadata = resolved.metadata;
      } else {
        await updateCartItemPrice(item.id, resolved.priceAtAdd);
      }

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
