"use client";

import { cn } from "@/lib/utils";
import {
  IconBrandFacebook,
  IconBrandInstagram,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.webp";
import { useProgramVisibility } from "@/app/components/ProgramVisibilityContext";

export default function CenteredWithLogo() {
  const { firstActiveHref } = useProgramVisibility();
  const adultHref = firstActiveHref("adult");
  const juniorHref = firstActiveHref("junior");

  const pages = [
    { title: "Home", href: "/" },
    ...(adultHref
      ? [{ title: "Adult Programs", href: adultHref }]
      : []),
    ...(juniorHref
      ? [{ title: "Junior Programs", href: juniorHref }]
      : []),
    { title: "Calendar", href: "/calendar" },
    { title: "Gift Cards", href: "/gift-cards" },
    { title: "Contact", href: "/contact" },
  ];
  return (
    <footer className="relative w-full overflow-hidden border-t border-neutral-200 bg-white px-8 py-16 md:py-20">
      <div className="mx-auto max-w-7xl text-sm text-neutral-500 md:px-8">
        <div className="relative flex w-full flex-col items-center justify-center">
          <div className="mb-6">
            <Logo />
          </div>

          <ul className="flex list-none flex-col items-center gap-4 font-sans text-sm font-medium text-neutral-600 sm:flex-row sm:gap-8">
            {pages.map((page) => (
              <li key={page.href} className="list-none">
                <Link
                  className="transition-colors hover:text-neutral-900"
                  href={page.href}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center font-sans text-sm text-neutral-500">
            <a
              href="tel:+12485633561"
              className="transition-colors hover:text-neutral-800"
            >
              (248) 563-3561
            </a>
            <span className="mx-2 text-neutral-300">·</span>
            <a
              href="mailto:toskigolfacademy@gmail.com"
              className="transition-colors hover:text-neutral-800"
            >
              toskigolfacademy@gmail.com
            </a>
          </p>

          <GridLineHorizontal className="mx-auto mt-8 max-w-7xl" />
        </div>

        <div className="mt-8 flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-sans text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Toski Golf Academy. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/toskigolfacademy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-neutral-500 transition-colors hover:text-neutral-800"
            >
              <IconBrandFacebook className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/toskigolfacademy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-neutral-500 transition-colors hover:text-neutral-800"
            >
              <IconBrandInstagram className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset || "200px",
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        className,
      )}
    ></div>
  );
};

const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center px-2 py-1"
    >
      <Image
        src={logo}
        alt="Toski Golf Academy"
        className="h-12 w-auto object-contain"
        sizes="176px"
      />
    </Link>
  );
};
