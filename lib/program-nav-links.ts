export type ProgramNavVariant = "adult" | "junior";

export type ProgramNavLink = {
  href: string;
  label: string;
  /** Sidebar page heading (h1) for this program */
  title: string;
};

export const ADULT_PROGRAM_NAV_LINKS: ProgramNavLink[] = [
  {
    href: "/adult-programs/get-golf-ready-level-1",
    label: "GET GOLF READY (LEVEL I)",
    title: "Get Golf Ready Level I",
  },
  {
    href: "/adult-programs/get-golf-ready-level-2",
    label: "GET GOLF READY (LEVEL II)",
    title: "Get Golf Ready Level II",
  },
  {
    href: "/adult-programs/short-game",
    label: "ADULT SHORT GAME SERIES",
    title: "Adult Short Game Series",
  },
  {
    href: "/adult-programs/women",
    label: "GOLF FOR WOMEN",
    title: "Golf For Women",
  },
  {
    href: "/adult-programs/private",
    label: "ADULT PRIVATE GOLF INSTRUCTION",
    title: "Adult Private Golf Instruction",
  },
  {
    href: "/adult-programs/open-practice",
    label: "ADULT OPEN PRACTICE",
    title: "Adult Open Practice",
  },
];

export const JUNIOR_PROGRAM_NAV_LINKS: ProgramNavLink[] = [
  {
    href: "/junior-programs/beginner-series",
    label: "JUNIOR BEGINNER SERIES",
    title: "Junior Beginner Series",
  },
  {
    href: "/junior-programs/developmental-series",
    label: "JUNIOR DEVELOPMENTAL SERIES",
    title: "Junior Developmental Series",
  },
  {
    href: "/junior-programs/private-instruction",
    label: "JUNIOR PRIVATE GOLF INSTRUCTION",
    title: "Junior Private Golf Instruction",
  },
];

export function getProgramNavLinks(
  variant: ProgramNavVariant,
): ProgramNavLink[] {
  return variant === "adult"
    ? ADULT_PROGRAM_NAV_LINKS
    : JUNIOR_PROGRAM_NAV_LINKS;
}

export function getProgramPageTitle(
  pathname: string | null | undefined,
  variant: ProgramNavVariant,
): string | null {
  if (!pathname) return null;
  const match = getProgramNavLinks(variant).find(
    (link) => link.href === pathname,
  );
  return match?.title ?? null;
}

export function getProgramNavActiveIndex(
  pathname: string | null | undefined,
  variant: ProgramNavVariant,
): number {
  if (!pathname) return -1;
  return getProgramNavLinks(variant).findIndex(
    (link) => link.href === pathname,
  );
}
