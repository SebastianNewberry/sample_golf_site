import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ProgramsOverview() {
  return (
    <section className="bg-white py-16 md:py-24 border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Three Columns text block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-16">
          {/* Column 1: JUNIOR GOLF CAMPS */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-golf-green mb-6 border-b-2 border-golf-orange pb-3 inline-block">
              Junior Golf Camps
            </h3>
            <p className="text-gray-600 font-serif leading-relaxed mb-4">
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
              className="text-orange-500 hover:text-orange-600 font-serif font-medium transition-colors flex items-center gap-1"
            >
              2026 Camp Information <span>→</span>
            </a>
          </div>

          {/* Column 2: ADULT PROGRAMS */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-golf-green mb-6 border-b-2 border-golf-orange pb-3 inline-block">
              Adult Programs
            </h3>
            
            <div className="mb-6">
              <h4 className="font-bold text-gray-700 font-serif mb-1">
                2026 Adult Programs
              </h4>
              <p className="text-gray-600 font-serif leading-relaxed mb-1">
                Registration is open for the 2026 season.<br/>
                Programs will begin in April.
              </p>
              <Link
                href="/adult-programs/get-golf-ready-level-1"
                className="text-orange-500 hover:text-orange-600 font-serif font-medium transition-colors"
              >
                Details
              </Link>
            </div>

            <div>
              <h4 className="font-bold text-gray-700 font-serif mb-1">
                Open Practice Schedule
              </h4>
              <p className="text-gray-600 font-serif leading-relaxed italic mb-1">
                Schedule for 2026 will be posted in April<br/>
                Sanctuary Lake Golf Course, Troy
              </p>
              <Link
                href="/adult-programs/open-practice"
                className="text-orange-500 hover:text-orange-600 font-serif font-medium transition-colors"
              >
                Details
              </Link>
            </div>
          </div>

          {/* Column 3: JUNIOR PROGRAMS */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-golf-green mb-6 border-b-2 border-golf-orange pb-3 inline-block">
              Junior Programs
            </h3>
            <h4 className="font-bold text-gray-700 font-serif mb-1">
              2026 Junior Programs
            </h4>
            <p className="text-gray-600 font-serif leading-relaxed mb-1">
              Registration is open for the 2026 season.<br/>
              Programs will begin in April.
            </p>
            <Link
              href="/junior-programs/beginner-series"
              className="text-orange-500 hover:text-orange-600 font-serif font-medium transition-colors"
            >
              Details
            </Link>
          </div>
        </div>

        {/* Schedule Button */}
        <div className="flex justify-center mb-20">
          <Button
            asChild
            className="bg-[#E86C00] hover:bg-[#CC5F00] text-white font-bold tracking-widest uppercase px-10 py-6 text-sm rounded-none"
          >
            <Link href="/contact">SCHEDULE A LESSON</Link>
          </Button>
        </div>

        {/* Professional Associations */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl text-gray-700 font-serif mb-12">
            - Professional Associations -
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 lg:gap-24 opacity-90">
            {/* We will use a fallback text or generic image if PGA is missing, but try to use existing images */}
            <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 text-center text-sm font-bold text-blue-900 border-4 border-blue-900 rounded-full bg-white shadow-sm p-4 leading-tight shrink-0">
              PGA OF AMERICA<br/>MEMBER
            </div>
            
            <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
              <Image 
                src="/us_kids_golf.webp" 
                alt="U.S. Kids Golf Certified Coach"
                fill
                className="object-contain"
              />
            </div>
            
            <div className="relative w-32 h-16 md:w-48 md:h-20 shrink-0">
              <Image 
                src="/titleist.webp" 
                alt="Titleist"
                fill
                className="object-contain"
              />
            </div>
            
            <div className="relative w-32 h-12 md:w-48 md:h-16 shrink-0">
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
