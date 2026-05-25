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
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Failed to Load Program</h2>
      <p className="text-gray-600 mb-6">
        There was a problem fetching the junior program details. Please try again.
      </p>
      <Button
        onClick={() => reset()}
        className="bg-golf-orange hover:bg-orange-600 text-white font-bold px-8 py-2 rounded-md"
      >
        Retry
      </Button>
    </div>
  );
}
