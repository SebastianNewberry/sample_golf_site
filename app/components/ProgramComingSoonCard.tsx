import Image from "next/image";
import { Calendar } from "lucide-react";

interface ProgramComingSoonCardProps {
  programName: string;
}

export default function ProgramComingSoonCard({
  programName,
}: ProgramComingSoonCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
          <Calendar className="text-orange-500" size={40} />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Program Coming Soon
          </h1>
          <p className="text-gray-600 max-w-md">
            The &quot;{programName}&quot; program is being set up. Please check
            back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
