export type ProgramAudience = "adult" | "junior";

export type ProgramCatalogEntry = {
  id: string;
  type: ProgramAudience;
  href: string;
  slug: string;
  pageTitle: string;
  sidebarLabel: string;
  navTitle: string;
  nameKey: string;
  showInNav: boolean;
  hero: "default" | "tall" | "juniorPrivate";
};

export const PROGRAM_CATALOG: ProgramCatalogEntry[] = [
  {
    id: "583078c5-6e1f-40fc-a1a0-8c1cc88a6d7b",
    type: "adult",
    href: "/adult-programs/get-golf-ready-level-1",
    slug: "get-golf-ready-level-1",
    pageTitle: "Get Golf Ready Level I",
    sidebarLabel: "GET GOLF READY (LEVEL I)",
    navTitle: "Get Golf Ready (Level I)",
    nameKey: "get golf ready (level i)",
    showInNav: true,
    hero: "default",
  },
  {
    id: "eb15499e-b573-4027-a2dc-1335bc7613b1",
    type: "adult",
    href: "/adult-programs/get-golf-ready-level-2",
    slug: "get-golf-ready-level-2",
    pageTitle: "Get Golf Ready Level II",
    sidebarLabel: "GET GOLF READY (LEVEL II)",
    navTitle: "Get Golf Ready (Level II)",
    nameKey: "get golf ready (level ii)",
    showInNav: true,
    hero: "default",
  },
  {
    id: "9bc2b2b7-2774-4971-b469-4ce2a8d3a707",
    type: "adult",
    href: "/adult-programs/short-game",
    slug: "short-game",
    pageTitle: "Adult Short Game Series",
    sidebarLabel: "ADULT SHORT GAME SERIES",
    navTitle: "Adult Short Game Series",
    nameKey: "adult short game series",
    showInNav: true,
    hero: "default",
  },
  {
    id: "9160a3a8-a652-4ddf-a13f-298336168e04",
    type: "adult",
    href: "/adult-programs/women",
    slug: "women",
    pageTitle: "Golf For Women",
    sidebarLabel: "GOLF FOR WOMEN",
    navTitle: "Golf For Women Program",
    nameKey: "golf for women",
    showInNav: true,
    hero: "tall",
  },
  {
    id: "f89b62ee-ffda-421d-a525-8bd2a580f24e",
    type: "adult",
    href: "/adult-programs/private",
    slug: "private",
    pageTitle: "Adult Private Golf Instruction",
    sidebarLabel: "ADULT PRIVATE GOLF INSTRUCTION",
    navTitle: "Adult Private Golf Instruction",
    nameKey: "adult private golf instruction",
    showInNav: true,
    hero: "tall",
  },
  {
    id: "0dc3ac70-8346-44c4-9ef6-b638ccbb9082",
    type: "adult",
    href: "/adult-programs/open-practice",
    slug: "open-practice",
    pageTitle: "Adult Open Practice",
    sidebarLabel: "ADULT OPEN PRACTICE",
    navTitle: "Adult Open Practice",
    nameKey: "adult open practice",
    showInNav: true,
    hero: "default",
  },
  {
    id: "0284e4eb-fd96-4626-9009-272b7d985d88",
    type: "junior",
    href: "/junior-programs/beginner-series",
    slug: "beginner-series",
    pageTitle: "Junior Beginner Series",
    sidebarLabel: "JUNIOR BEGINNER SERIES",
    navTitle: "Junior Beginner Series",
    nameKey: "junior beginner series",
    showInNav: true,
    hero: "default",
  },
  {
    id: "cc6a73ca-95fb-4acb-be01-6cee4ce44475",
    type: "junior",
    href: "/junior-programs/developmental-series",
    slug: "developmental-series",
    pageTitle: "Junior Developmental Series",
    sidebarLabel: "JUNIOR DEVELOPMENTAL SERIES",
    navTitle: "Junior Developmental Series",
    nameKey: "junior developmental series",
    showInNav: true,
    hero: "default",
  },
  {
    id: "8102629d-9ec3-4034-beca-16683db482f2",
    type: "junior",
    href: "/junior-programs/developmental-camp",
    slug: "developmental-camp",
    pageTitle: "Junior Developmental Camp",
    sidebarLabel: "JUNIOR DEVELOPMENTAL CAMP",
    navTitle: "Junior Developmental Camp",
    nameKey: "junior developmental camp",
    showInNav: false,
    hero: "default",
  },
  {
    id: "754bf4be-0ef6-4123-b5ff-b107e03c2f10",
    type: "junior",
    href: "/junior-programs/private-instruction",
    slug: "private-instruction",
    pageTitle: "Junior Private Golf Instruction",
    sidebarLabel: "JUNIOR PRIVATE GOLF INSTRUCTION",
    navTitle: "Junior Private Golf Instruction",
    nameKey: "junior private instruction",
    showInNav: true,
    hero: "juniorPrivate",
  },
];

export type ProgramVisibilityRow = {
  id: string;
  isActive: boolean;
  type: string;
  name: string;
};

export function isPublicProgram<T extends { isActive: boolean }>(
  program: T | null | undefined,
): program is T {
  return Boolean(program?.isActive);
}

export function getCatalogEntryByHref(href: string) {
  const path = href.split("?")[0];
  return PROGRAM_CATALOG.find((entry) => entry.href === path);
}

export function getCatalogEntryById(id: string) {
  return PROGRAM_CATALOG.find((entry) => entry.id === id);
}

export function getProgramUrlFromName(
  programName: string,
  sessionId?: string,
) {
  const normalizedName = programName.trim().toLowerCase();
  const exact = PROGRAM_CATALOG.find((entry) => entry.nameKey === normalizedName);
  const entry =
    exact ??
    [...PROGRAM_CATALOG]
      .sort((a, b) => b.nameKey.length - a.nameKey.length)
      .find((item) => normalizedName.includes(item.nameKey));

  if (!entry) return undefined;
  return sessionId ? `${entry.href}?sessionId=${sessionId}` : entry.href;
}

export function buildVisibilityIndex(programs: ProgramVisibilityRow[]) {
  const activeIds = new Set(
    programs.filter((program) => program.isActive).map((program) => program.id),
  );

  const isIdActive = (id: string) => activeIds.has(id);

  const isHrefActive = (href: string) => {
    const entry = getCatalogEntryByHref(href);
    if (!entry) return true;
    return activeIds.has(entry.id);
  };

  const visibleCatalog = (type?: ProgramAudience, navOnly = false) =>
    PROGRAM_CATALOG.filter((entry) => {
      if (type && entry.type !== type) return false;
      if (navOnly && !entry.showInNav) return false;
      return activeIds.has(entry.id);
    });

  const firstActiveHref = (type: ProgramAudience) =>
    visibleCatalog(type, true)[0]?.href;

  return {
    activeIds,
    isIdActive,
    isHrefActive,
    visibleCatalog,
    firstActiveHref,
  };
}
