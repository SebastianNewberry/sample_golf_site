"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        We encountered an error while loading this page.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-golf-green hover:bg-golf-green-dark text-white font-bold px-8 py-2 rounded-md"
        >
          Try again
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-gray-300 text-gray-700 font-bold px-8 py-2 rounded-md"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
}
