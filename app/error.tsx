"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import logo from "@/public/logo.webp";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled runtime error:", error);
  }, [error]);

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
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image src={logo} alt="Toski Golf Academy" />
        </div>

        {/* Error Header */}
        <div className="mb-10">
          <div className="relative inline-flex items-center justify-center p-4 bg-red-50 rounded-full mb-6 border border-red-200 shadow-sm">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 text-lg">
            We apologize for the inconvenience. An unexpected error occurred while loading this page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[hsl(var(--golf-green))] hover:bg-[hsl(var(--golf-green-dark))] text-white px-8 py-6 text-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-102 flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-2 border-[hsl(var(--golf-orange))] text-[hsl(var(--golf-orange))] hover:bg-[hsl(var(--golf-orange))]/10 px-8 py-6 text-lg shadow-sm transition-all duration-300 hover:scale-102 flex items-center gap-2"
          >
            <Link href="/">
              <Home className="w-5 h-5" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
