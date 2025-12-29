import { Button } from "@/components/ui/button";
import Image from "next/image";
import pgaOfAmerica from "@/public/adult_private_instruction.webp";
import usKidsGolf from "@/public/us_kids_golf.webp";
import titleist from "@/public/titleist.webp";
import trackman from "@/public/trackman.webp";

export default function ProgramCards() {
  const programs = [
    {
      title: "JUNIOR GOLF CAMPS",
      description:
        "Exciting programs for new junior golfers and those looking to improve their skills in a fun, supportive environment.",
    },
    {
      title: "ADULT PROGRAMS",
      description:
        "2026 programs starting in April. Schedules available in January. Private and group instruction available for all skill levels.",
    },
    {
      title: "JUNIOR PROGRAMS",
      description:
        "2026 programs starting in April at Sanctuary Lake Golf Course, Troy. Comprehensive junior development programs.",
    },
  ];

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {programs.map((program, index) => (
            <div key={index} className="text-center space-y-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 tracking-wide">
                {program.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                {program.description}
              </p>
              <a
                href="#"
                className="inline-block text-orange-500 font-medium hover:text-orange-600 transition-colors text-base"
              >
                Details →
              </a>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button className="tracking-wide uppercase">SCHEDULE A LESSON</Button>
        </div>

        {/* Professional Associations */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 items-center justify-items-center gap-6 md:gap-8">
            {/* PGA of America */}
            <Image
              src={pgaOfAmerica}
              alt="PGA of America"
              className="w-auto h-32 md:h-64 object-contain"
            />

            {/* U.S. Kids Golf */}
            <Image
              src={usKidsGolf}
              alt="U.S. Kids Golf"
              className="w-auto h-32 md:h-64 object-contain"
            />

            {/* Titleist */}
            <Image
              src={titleist}
              alt="Titleist"
              className="w-auto h-32 md:h-64 object-contain"
            />

            {/* TrackMan */}
            <Image
              src={trackman}
              alt="TrackMan"
              className="w-auto h-32 md:h-64 object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
