import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import pgaOfAmerica from "@/public/adult_private_instruction.webp";
import { getProgramVisibility } from "@/db/queries/programs";
import { buildVisibilityIndex } from "@/lib/program-catalog";

export default async function ProgramsOverview() {
  const programs = await getProgramVisibility();
  const { firstActiveHref, isHrefActive } = buildVisibilityIndex(programs);
  const adultHref = firstActiveHref("adult");
  const juniorHref = firstActiveHref("junior");
  const showOpenPractice = isHrefActive("/adult-programs/open-practice");
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-xl font-bold uppercase tracking-wide text-neutral-800 md:text-2xl">
            2026 Golf Season Programs Are Now Open for Registration
          </h2>
          <p className="mt-4 text-sm text-neutral-600 md:text-base">
            Call or text Paul Toski at{" "}
            <a
              href="tel:+12485633561"
              className="font-medium text-neutral-800 transition-colors hover:text-golf-orange"
            >
              (248) 563-3561
            </a>{" "}
            with questions or to schedule an appointment.
          </p>
        </div>

        <div className="border-y border-neutral-200 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3 md:gap-10">
            <div className="flex flex-col items-center">
              <h3 className="mb-5 text-lg font-bold uppercase tracking-wide text-neutral-800 md:text-xl">
                Junior Golf Camps
              </h3>
              <p className="mb-4 leading-relaxed text-neutral-600">
                Junior Golf Camps for the 2026 season at Sanctuary Lake Golf
                Course can be found through the PGA Coach website (use the link
                below). Ryan Schudlich is taking over the program after working
                with Toski Golf Academy over the past few seasons. Camps will
                begin the week of June 15th.
              </p>
              <a
                href="https://www.pga.com/coach/ryanschudlich"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-golf-orange transition-colors hover:text-golf-orange/80"
              >
                2026 Camp Information
              </a>
            </div>

            <div className="flex flex-col items-center">
              <h3 className="mb-5 text-lg font-bold uppercase tracking-wide text-neutral-800 md:text-xl">
                Adult Programs
              </h3>

              <div className="mb-8">
                <h4 className="mb-2 font-semibold text-neutral-800">
                  2026 Adult Programs
                </h4>
                <p className="mb-2 leading-relaxed text-neutral-600">
                  Registration is open for the 2026 season.
                  <br />
                  Programs will begin in April.
                </p>
                {adultHref ? (
                  <Link
                    href={adultHref}
                    className="font-medium text-golf-orange transition-colors hover:text-golf-orange/80"
                  >
                    Details
                  </Link>
                ) : null}
              </div>

              {showOpenPractice ? (
              <div>
                <h4 className="mb-2 font-semibold text-neutral-800">
                  Open Practice Schedule
                </h4>
                <p className="mb-2 leading-relaxed text-neutral-600">
                  Schedule for 2026 will be posted in April
                  <br />
                  Sanctuary Lake Golf Course, Troy
                </p>
                <Link
                  href="/adult-programs/open-practice"
                  className="font-medium text-golf-orange transition-colors hover:text-golf-orange/80"
                >
                  Details
                </Link>
              </div>
              ) : null}
            </div>

            <div className="flex flex-col items-center">
              <h3 className="mb-5 text-lg font-bold uppercase tracking-wide text-neutral-800 md:text-xl">
                Junior Programs
              </h3>
              <h4 className="mb-2 font-semibold text-neutral-800">
                2026 Junior Programs
              </h4>
              <p className="mb-2 leading-relaxed text-neutral-600">
                Registration is open for the 2026 season.
                <br />
                Programs will begin in April.
              </p>
              {juniorHref ? (
                <Link
                  href={juniorHref}
                  className="font-medium text-golf-orange transition-colors hover:text-golf-orange/80"
                >
                  Details
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center md:mt-16">
          <Button
            asChild
            className="rounded-md bg-golf-orange px-10 py-6 text-sm font-bold uppercase tracking-widest text-white hover:bg-golf-orange/90"
          >
            <Link href="/contact">Schedule a Lesson</Link>
          </Button>
        </div>

        <div className="mt-20 text-center md:mt-24">
          <h2 className="mb-12 text-xl font-semibold tracking-wide text-neutral-800 md:text-2xl">
            - Professional Associations -
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-10 opacity-90 md:gap-16 lg:gap-24">
            <div className="relative h-32 w-32 shrink-0 md:h-40 md:w-40">
              <Image
                src={pgaOfAmerica}
                alt="PGA of America Member"
                fill
                className="object-contain"
              />
            </div>

            <div className="relative h-32 w-32 shrink-0 md:h-40 md:w-40">
              <Image
                src="/us_kids_golf.webp"
                alt="U.S. Kids Golf Certified Coach"
                fill
                className="object-contain"
              />
            </div>

            <div className="relative h-16 w-32 shrink-0 md:h-20 md:w-48">
              <Image
                src="/titleist.webp"
                alt="Titleist"
                fill
                className="object-contain"
              />
            </div>

            <div className="relative h-12 w-32 shrink-0 md:h-16 md:w-48">
              <Image
                src="/trackman.webp"
                alt="Trackman"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
