import Link from "next/link";

interface AdultProgramSidebarProps {
  currentPath: string;
}

const ADULT_PROGRAMS = [
  { href: "/adult-programs/get-golf-ready-level-1", label: "GET GOLF READY PROGRAM (LEVEL I)" },
  { href: "/adult-programs/get-golf-ready-level-2", label: "GET GOLF READY PROGRAM (LEVEL II)" },
  { href: "/adult-programs/short-game", label: "ADULT SHORT GAME SERIES" },
  { href: "/adult-programs/women", label: "GOLF FOR WOMEN PROGRAM" },
  { href: "/adult-programs/private", label: "ADULT PRIVATE GOLF INSTRUCTION" },
  { href: "/adult-programs/open-practice", label: "ADULT OPEN PRACTICE" },
];

export function AdultProgramSidebar({ currentPath }: AdultProgramSidebarProps) {
  return (
    <div className="space-y-0">
      {ADULT_PROGRAMS.map((program) => {
        const isActive = currentPath === program.href;
        return (
          <Link
            key={program.href}
            href={program.href}
            className={`block px-4 py-3 text-sm transition-all ${
              isActive
                ? "bg-white border-l-4 border-orange-500 font-bold text-gray-800"
                : "bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            }`}
          >
            {program.label}
          </Link>
        );
      })}
    </div>
  );
}

