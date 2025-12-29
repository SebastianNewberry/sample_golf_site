import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Hero Image Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero.webp"
          alt="Golf Course - Toski Golf Academy"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <p className="text-white text-base md:text-lg font-light tracking-wide mb-4 italic">
          Welcome To
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-widest uppercase">
          TOSKI GOLF ACADEMY
        </h1>
        <p className="text-white text-base md:text-lg font-light tracking-wide italic">
          - Troy, Michigan -
        </p>
        <div className="mt-8">
          <Button
            className="tracking-wide uppercase"
          >
            CONTACT US
          </Button>
        </div>
      </div>
    </section>
  );
}
