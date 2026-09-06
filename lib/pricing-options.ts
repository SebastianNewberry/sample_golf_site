/**
 * Pure pricing-option helpers (safe for client and server).
 */

export interface PricingOption {
  id: string;
  title?: string;
  price: number | string;
  sessionCount?: number;
  durationMinutes?: number;
  playersCount?: number;
  coachesCount?: number;
  isOnCourse?: boolean;
}

export const ON_COURSE_MAX_PLAYERS = 4;

export interface CartItemLineInput {
  quantity: number;
  priceAtAdd: string;
  metadata?: string | null;
}

export function parsePricingOptions(pricingOptions: unknown): PricingOption[] {
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

export function parseCartMetadata(
  metadata: string | null | undefined,
): Record<string, unknown> {
  if (!metadata) return {};
  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function perPlayerUnitPrice(
  packagePrice: number,
  playersCount: number,
): string {
  const players = Math.max(1, Number(playersCount) || 1);
  return (Math.round((packagePrice / players) * 100) / 100).toFixed(2);
}

export function cartItemLineTotal(item: CartItemLineInput): number {
  const meta = parseCartMetadata(item.metadata);
  const packagePrice = Number(meta.packagePrice);
  const packagePlayers = Number(meta.playersCount);
  if (
    meta.isOnCourse &&
    Number.isFinite(packagePrice) &&
    packagePrice > 0 &&
    packagePlayers > 0 &&
    packagePlayers === item.quantity
  ) {
    return Math.round(packagePrice * 100) / 100;
  }

  return (
    Math.round(Number(item.priceAtAdd) * item.quantity * 100) / 100
  );
}

function sameLessonFamily(a: PricingOption, b: PricingOption): boolean {
  return (
    Number(a.sessionCount) === Number(b.sessionCount) &&
    Number(a.durationMinutes) === Number(b.durationMinutes)
  );
}

export function onCourseFamily(
  options: PricingOption[],
  current: PricingOption,
): PricingOption[] {
  return options.filter(
    (option) => Boolean(option.isOnCourse) && sameLessonFamily(option, current),
  );
}

export function getOnCoursePlayerRange(
  options: PricingOption[],
  current: PricingOption,
): { min: number; max: number } | null {
  const family = onCourseFamily(options, current);
  if (family.length === 0) return null;
  const counts = family.map((option) => Number(option.playersCount) || 1);
  return {
    min: Math.min(...counts),
    max: Math.min(ON_COURSE_MAX_PLAYERS, Math.max(...counts)),
  };
}

/**
 * Pick the on-course package for a player count: lowest coach tier that
 * can cover that many players, then the option whose playersCount matches.
 */
export function findOnCoursePackageForPlayers(
  options: PricingOption[],
  current: PricingOption,
  playerCount: number,
): PricingOption | null {
  if (playerCount < 1 || playerCount > ON_COURSE_MAX_PLAYERS) return null;

  const family = onCourseFamily(options, current);
  if (family.length === 0) return null;

  const byCoaches = new Map<number, PricingOption[]>();
  for (const option of family) {
    const coaches = Number(option.coachesCount) || 1;
    const list = byCoaches.get(coaches) ?? [];
    list.push(option);
    byCoaches.set(coaches, list);
  }

  const tiers = [...byCoaches.entries()]
    .map(([coaches, opts]) => ({
      coaches,
      maxPlayers: Math.max(...opts.map((o) => Number(o.playersCount) || 1)),
      opts,
    }))
    .sort((a, b) => a.coaches - b.coaches);

  const tier = tiers.find((entry) => entry.maxPlayers >= playerCount);
  if (!tier) return null;

  return (
    tier.opts.find((option) => Number(option.playersCount) === playerCount) ??
    null
  );
}

export function applyPackageToMetadata(
  metadata: string | null | undefined,
  pkg: PricingOption,
): string {
  const meta = parseCartMetadata(metadata);
  return JSON.stringify({
    ...meta,
    packageId: pkg.id,
    duration: pkg.title ?? meta.duration,
    playersCount: Number(pkg.playersCount) || 1,
    coachesCount: Number(pkg.coachesCount) || 0,
    isOnCourse: Boolean(pkg.isOnCourse),
    packagePrice: Number(pkg.price),
  });
}

export function getCartItemOnCourseLimits(item: {
  metadata?: string | null;
  program?: { pricingOptions?: unknown } | null;
}): { isOnCourse: boolean; min: number; max: number } {
  const meta = parseCartMetadata(item.metadata);
  const isOnCourse = Boolean(meta.isOnCourse);
  if (!isOnCourse) {
    const min = Number(meta.playersCount) > 0 ? Number(meta.playersCount) : 1;
    return { isOnCourse: false, min, max: Number.POSITIVE_INFINITY };
  }

  const options = parsePricingOptions(item.program?.pricingOptions);
  const current =
    options.find((option) => option.id === meta.packageId) ??
    options.find((option) => option.isOnCourse);

  if (current) {
    const range = getOnCoursePlayerRange(options, current);
    if (range) return { isOnCourse: true, min: range.min, max: range.max };
  }

  const fallbackMax = Math.min(
    ON_COURSE_MAX_PLAYERS,
    Number(meta.playersCount) || ON_COURSE_MAX_PLAYERS,
  );
  return { isOnCourse: true, min: 1, max: fallbackMax };
}
