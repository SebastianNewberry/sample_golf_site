import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logo from "@/public/logo.webp";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/hero.webp"
          alt="Golf Course Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Logo - Made even bigger without border */}
        <div className="flex justify-center mb-10">
          <Image src={logo} alt="Toski Golf Academy" />
        </div>

        {/* 404 Text with improved styling */}
        <div className="mb-10">
          <div className="relative inline-block mb-6">
            <h1 className="text-9xl font-bold text-[hsl(var(--golf-green))] opacity-90">
              404
            </h1>
            <div className="absolute inset-0 text-9xl font-bold text-[hsl(var(--golf-green-dark))] blur-sm -z-10"></div>
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Oops! Page Not Found
          </h2>
        </div>

        {/* Combined content box with text and quote */}
        <Card className="p-8 mb-10 bg-white/80 backdrop-blur-sm border-2 border-[hsl(var(--golf-green))]/20 shadow-xl">
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Looks like you've hit a ball out of bounds. The page you're looking
            for doesn't exist or has been moved.
          </p>

          <blockquote className="text-xl text-gray-700 italic font-medium border-t pt-6">
            "Every golfer has a bad day, but every bad day ends. Let's get you
            back on course."
          </blockquote>
        </Card>

        {/* Action Buttons with improved styling */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            asChild
            className="bg-[hsl(var(--golf-orange))] hover:bg-[hsl(var(--golf-orange))]/90 text-white px-10 py-4 text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
