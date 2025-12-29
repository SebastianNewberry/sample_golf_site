"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import logo from "@/public/logo.webp";
import aboutOurJuniorPrograms from "@/public/junior_programs.webp";
import pgaMember from "@/public/adult_private_instruction.webp";
import usKidsGolfCertified from "@/public/us_kids_golf.webp";

const adultPrograms = [
  {
    title: "Get Golf Ready (Level I)",
    desc: "Learn the fundamentals of golf including pitching, chipping, putting, and full swing. A PGA National program for beginners to build confidence and learn proper course etiquette.",
    href: "/adult-programs/get-golf-ready-level-1",
  },
  {
    title: "Get Golf Ready (Level II)",
    desc: "Build on Level I skills with personalized instruction and comprehensive video analysis. Includes on-course coaching to take your game to the next level.",
    href: "/adult-programs/get-golf-ready-level-2",
  },
  {
    title: "Adult Short Game Series",
    desc: "Focus exclusively on developing your short game technique for improved scoring within 100 yards of the hole. Includes wedge fitting by a certified Titleist Club Fitter.",
    href: "/adult-programs/short-game",
  },
  {
    title: "Golf For Women Program",
    desc: "A time-tested program designed for new golfers and experienced players to learn the game and build confidence. Includes personalized instruction on fundamentals and course navigation.",
    href: "/adult-programs/women",
  },
  {
    title: "Adult Private Golf Instruction",
    desc: "Receive individual instruction with high-speed video analysis and personalized improvement plans. Identify your goals and learn specific drills to enhance your skills.",
    href: "/adult-programs/private",
  },
  {
    title: "Adult Open Practice",
    desc: "Flexible practice sessions available throughout the season. Perfect for refining your skills in a supportive environment with access to practice facilities.",
    href: "/adult-programs/open-practice",
  },
];

const juniorPrograms = [
  {
    type: "section",
    title: "About Our Junior Programs",
    desc: "Our junior programs are designed to benefit boys and girls of all athletic abilities, levels of golf experience and competitive desire.",
    fullDesc:
      "Whether your child has collegiate scholarship aspirations, interest in playing high school golf or simply want to learn how to play, they will be warmly welcomed in our Academy. Your child will learn all about the elements that influence their performance on the golf course. It is our belief that juniors will perform better when they learn how to manage their physical, mental and emotional state and become independent players on the golf course.",
  },
  {
    type: "separator",
  },
  {
    type: "section",
    title: "PGA & U.S. Kids Golf Certified",
    desc: "Our mission is to share our passion for the great game of golf with juniors in our area. Our promise is to support, encourage and respect each and every one of our students and inspire them to identify and reach their full potential in golf.",
    fullDesc:
      "Our junior programs are described on this website and we encourage you to contact our professional staff with any questions about our academy, our schedules or how to choose the right program for your child. We look forward to seeing your junior golfer in one of our programs this season.",
  },
  {
    type: "separator",
  },
  {
    title: "Junior Beginner Series",
    desc: "For new junior golfers ages 7-17. Learn fundamentals with 6 one-hour sessions including on-course experience.",
    href: "/junior-programs/beginner-series",
  },
  {
    title: "Junior Developmental Series",
    desc: "For intermediate players ages 9-17. Advanced curriculum with video analysis and personalized improvement plans.",
    href: "/junior-programs/developmental-series",
  },
  {
    title: "Junior Golf Camp",
    desc: "Fun week-long camp for ages 8-12. Learn fundamentals and build confidence in a supportive environment.",
    href: "/junior-programs/golf-camp",
  },
  {
    title: "Junior Developmental Golf Camp",
    desc: "Advanced camp for ages 9-17. Includes daily 9-hole play, video analysis, and professional coaching.",
    href: "/junior-programs/developmental-camp",
  },
  {
    title: "Junior Private Golf Instruction",
    desc: "Individual instruction with PGA Professional. Private lessons and on-course coaching available.",
    href: "/junior-programs/private-instruction",
  },
];

const tapProps = {
  whileTap: { scale: 0.98 },
  transition: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.6,
  },
};

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [adultProgramsOpen, setAdultProgramsOpen] = useState(false);
  const [juniorProgramsOpen, setJuniorProgramsOpen] = useState(false);

  // Determine active state
  const isAdultProgramsActive = pathname?.startsWith("/adult-programs");
  const isJuniorProgramsActive = pathname?.startsWith("/junior-programs");
  const isContactActive = pathname === "/contact";
  const isHomeActive = pathname === "/";

  return (
    <nav className="w-full bg-gray-200 border-b border-gray-300 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex w-full items-center justify-between gap-3 md:w-auto">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src={logo}
                alt="Toski Golf Academy"
                className="w-[200px] h-auto"
              />
            </Link>
            <motion.button
              aria-label="Toggle menu"
              className="hover:bg-gray-300 inline-flex size-10 items-center justify-center rounded-md border md:hidden"
              onClick={() => setOpen((s) => !s)}
              whileTap={{ scale: 0.92 }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className={`hover:bg-gray-300 rounded-md px-4 py-2 text-sm font-bold ${
                isHomeActive ? "text-orange-600" : "text-gray-800"
              }`}
            >
              HOME
            </Link>

            {/* Junior Programs Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setJuniorProgramsOpen(true)}
                onMouseLeave={() => setJuniorProgramsOpen(false)}
                className={`inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-bold cursor-pointer ${
                  isJuniorProgramsActive ? "text-orange-600" : "text-gray-800"
                } ${juniorProgramsOpen ? "bg-gray-300" : "hover:bg-gray-300"}`}
              >
                JUNIOR PROGRAMS <ChevronDown size={16} />
              </button>
              {/* Invisible hover bridge to prevent dropdown from closing when moving between button and dropdown */}
              <div
                className="absolute top-full left-0 h-2 w-full"
                onMouseEnter={() => setJuniorProgramsOpen(true)}
                onMouseLeave={() => setJuniorProgramsOpen(false)}
              />
              <AnimatePresence>
                {juniorProgramsOpen && (
                  <motion.div
                    onMouseEnter={() => setJuniorProgramsOpen(true)}
                    onMouseLeave={() => setJuniorProgramsOpen(false)}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="bg-gray-200 absolute top-full left-0 z-20 mt-2 w-[700px] rounded-xl p-4 shadow-lg ring ring-gray-300"
                  >
                    <div className="flex gap-4">
                      {/* First column - Introduction sections */}
                      <div className="flex-[2] space-y-4">
                        {/* About Our Junior Programs */}
                        <div className="space-y-3">
                          <p className="text-base font-bold text-gray-800">
                            About Our Junior Programs
                          </p>
                          <Image
                            src={aboutOurJuniorPrograms}
                            alt="Junior Programs"
                            className="w-full h-[280px] object-cover rounded-md"
                          />
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Our junior programs are designed to benefit boys and
                            girls of all athletic abilities, levels of golf
                            experience and competitive desire.
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Our programs focus on practice and on-course
                            coaching sessions that provide juniors with a unique
                            opportunity to develop technical and playing skills,
                            learn how to practice them and then understand how
                            to integrate them into their game. Our approach
                            focuses on consistent, high quality standards from
                            all of our coaches, who are all extensively trained
                            by Paul Toski in junior-specific instruction,
                            technique and strategies.
                          </p>
                          <div className="grid grid-cols-2 gap-3 pt-3">
                            <div className="space-y-2">
                              <div className="relative h-[160px] w-full">
                                <Image
                                  src={pgaMember}
                                  alt="PGA Member"
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                              <p className="text-xs text-gray-600 text-center font-semibold">
                                PGA Member
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="relative h-[160px] w-full">
                                <Image
                                  src={usKidsGolfCertified}
                                  alt="US Kids Golf Certified"
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                              <p className="text-xs text-gray-600 text-center font-semibold">
                                U.S. Kids Golf Certified
                              </p>
                            </div>
                          </div>
                          <div className="pt-3">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Our mission is to share our passion for the great
                              game of golf with juniors in our area. Our promise
                              is to support, encourage and respect each and
                              every one of our students and inspire them to
                              identify and reach their full potential in golf.
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed mt-2">
                              Our junior programs are described on this website
                              and we encourage you to contact our professional
                              staff with any questions about our academy, our
                              schedules or how to choose the right program for
                              your child. We look forward to seeing your junior
                              golfer in one of our programs this season.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="w-px bg-gray-300" />

                      {/* One column for program links */}
                      <div className="flex-1 grid grid-cols-1 gap-2">
                        {juniorPrograms
                          .filter(
                            (program) =>
                              program.type !== "separator" &&
                              program.type !== "section"
                          )
                          .map((program) => (
                            <a
                              key={program.title}
                              href={program.href}
                              className={`hover:bg-gray-300 block rounded-md p-2 ${
                                pathname === program.href ? "bg-gray-300" : ""
                              }`}
                            >
                              <p
                                className={`text-sm font-bold ${
                                  pathname === program.href
                                    ? "text-orange-600"
                                    : "text-gray-800"
                                }`}
                              >
                                {program.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                {program.desc}
                              </p>
                            </a>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Adult Programs Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setAdultProgramsOpen(true)}
                onMouseLeave={() => setAdultProgramsOpen(false)}
                className={`inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-bold cursor-pointer ${
                  isAdultProgramsActive ? "text-orange-600" : "text-gray-800"
                } ${adultProgramsOpen ? "bg-gray-300" : "hover:bg-gray-300"}`}
              >
                ADULT PROGRAMS <ChevronDown size={16} />
              </button>
              {/* Invisible hover bridge to prevent dropdown from closing when moving between button and dropdown */}
              <div
                className="absolute top-full left-0 h-2 w-full"
                onMouseEnter={() => setAdultProgramsOpen(true)}
                onMouseLeave={() => setAdultProgramsOpen(false)}
              />
              <AnimatePresence>
                {adultProgramsOpen && (
                  <motion.div
                    onMouseEnter={() => setAdultProgramsOpen(true)}
                    onMouseLeave={() => setAdultProgramsOpen(false)}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="bg-gray-200 absolute top-full left-0 z-20 mt-2 w-[520px] rounded-xl p-4 shadow-lg ring ring-gray-300"
                  >
                    <ul className="grid grid-cols-2 gap-2">
                      {adultPrograms.map((program) => (
                        <li key={program.title}>
                          <a
                            href={program.href}
                            className={`hover:bg-gray-300 block rounded-md p-2 ${
                              pathname === program.href ? "bg-gray-300" : ""
                            }`}
                          >
                            <p
                              className={`text-sm font-bold ${
                                pathname === program.href
                                  ? "text-orange-600"
                                  : "text-gray-800"
                              }`}
                            >
                              {program.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {program.desc}
                            </p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/contact"
              className={`hover:bg-gray-300 rounded-md px-4 py-2 text-sm font-bold ${
                isContactActive ? "text-orange-600" : "text-gray-800"
              }`}
            >
              CONNECT WITH US
            </Link>
          </div>

          {/* Contact Button */}
          <div className="hidden items-center gap-2 md:flex">
            <a href="tel:+12488790909" className="hidden sm:block">
              <Button variant="outline">{`(248) 879-0909`}</Button>
            </a>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="border-t border-gray-300 py-2 md:hidden"
            >
              <details className="px-3">
                <summary
                  className={`hover:bg-gray-300 flex cursor-pointer list-none items-center justify-between rounded-md px-0 py-2 text-sm font-bold ${
                    isJuniorProgramsActive ? "text-orange-600" : "text-gray-800"
                  }`}
                >
                  <span>JUNIOR PROGRAMS</span>
                  <ChevronDown size={16} />
                </summary>
                <div className="mt-2 rounded-lg border border-gray-300 p-2 bg-gray-200">
                  <div className="space-y-4">
                    {/* About Our Junior Programs */}
                    <div className="space-y-2">
                      <p className="text-base font-bold text-gray-800">
                        About Our Junior Programs
                      </p>
                      <div className="w-full h-48 bg-black rounded-lg" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Our junior programs are designed to benefit boys and
                        girls of all athletic abilities, levels of golf
                        experience and competitive desire.
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Our programs focus on practice and on-course coaching
                        sessions that provide juniors with a unique opportunity
                        to develop technical and playing skills, learn how to
                        practice them and then understand how to integrate them
                        into their game.
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="space-y-1">
                          <div className="w-full h-28 bg-black rounded-lg" />
                          <p className="text-xs text-gray-600 text-center font-semibold">
                            PGA Member
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-28 bg-black rounded-lg" />
                          <p className="text-xs text-gray-600 text-center font-semibold">
                            U.S. Kids Golf Certified
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pt-2">
                        Our mission is to share our passion for the great game
                        of golf with juniors in our area. Our promise is to
                        support, encourage and respect each and every one of our
                        students and inspire them to identify and reach their
                        full potential in golf.
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Our junior programs are described on this website and we
                        encourage you to contact our professional staff with any
                        questions about our academy, our schedules or how to
                        choose the right program for your child. We look forward
                        to seeing your junior golfer in one of our programs this
                        season.
                      </p>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-300" />

                    {/* Program Links */}
                    <ul className="grid grid-cols-1 gap-1">
                      {juniorPrograms
                        .filter(
                          (program) =>
                            program.type !== "separator" &&
                            program.type !== "section"
                        )
                        .map((program) => (
                          <li key={program.title}>
                            <a
                              href={program.href}
                              className={`hover:bg-gray-300 flex flex-col rounded-md px-2 py-2 text-sm ${
                                pathname === program.href ? "bg-gray-300" : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <p
                                  className={`font-bold ${
                                    pathname === program.href
                                      ? "text-orange-600"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {program.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {program.desc}
                                </p>
                              </div>
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </details>

              <details className="px-3">
                <summary
                  className={`hover:bg-gray-300 flex cursor-pointer list-none items-center justify-between rounded-md px-0 py-2 text-sm font-bold ${
                    isAdultProgramsActive ? "text-orange-600" : "text-gray-800"
                  }`}
                >
                  <span>ADULT PROGRAMS</span>
                  <ChevronDown size={16} />
                </summary>
                <div className="mt-2 rounded-lg border border-gray-300 p-2 bg-gray-200">
                  <ul className="grid grid-cols-2 gap-1">
                    {adultPrograms.map((program) => (
                      <li key={program.title}>
                        <a
                          href={program.href}
                          className={`hover:bg-gray-300 flex flex-col rounded-md px-2 py-2 text-sm ${
                            pathname === program.href ? "bg-gray-300" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <p
                              className={`font-bold ${
                                pathname === program.href
                                  ? "text-orange-600"
                                  : "text-gray-800"
                              }`}
                            >
                              {program.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {program.desc}
                            </p>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              <a
                href="/"
                className={`hover:bg-gray-300 flex items-center justify-between rounded-md px-3 py-2 text-sm font-bold ${
                  isHomeActive ? "text-orange-600" : "text-gray-800"
                }`}
              >
                <span>HOME</span>
                <ChevronRight
                  size={16}
                  className="text-gray-600 ml-3 shrink-0"
                />
              </a>

              <a
                href="/contact"
                className={`hover:bg-gray-300 flex items-center justify-between rounded-md px-3 py-2 text-sm font-bold ${
                  isContactActive ? "text-orange-600" : "text-gray-800"
                }`}
              >
                <span>CONNECT WITH US</span>
                <ChevronRight
                  size={16}
                  className="text-gray-600 ml-3 shrink-0"
                />
              </a>

              <div className="flex items-center gap-2 px-3 pt-2">
                <a href="tel:+12488790909">
                  <Button variant="outline" className="w-full">
                    {"(248) 879-0909"}
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
