import { Button } from "@/components/ui/button";

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
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {/* PGA of America */}
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-500 text-center px-2">
                  PGA OF AMERICA
                </span>
              </div>
            </div>

            {/* U.S. Kids Golf */}
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-500 text-center px-2">
                  U.S. KIDS GOLF
                </span>
              </div>
            </div>

            {/* Titleist */}
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-500 text-center px-2">
                  TITLEIST
                </span>
              </div>
            </div>

            {/* TrackMan */}
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-500 text-center px-2">
                  TRACKMAN
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
