import { CheckCircle2 } from "lucide-react";
import getGolfReadyLevel1 from "@/public/golf_ready_level1.webp";
import Image from "next/image";
import Link from "next/link";
import {
  getProgramByCategory,
  getProgramSessions,
} from "@/db/queries/programs";
import { ProgramPurchaseSection } from "./ProgramPurchaseSection";
import {
  ProgramDetailsSection,
  DEFAULT_ADULT_PROGRAM_DETAILS,
} from "@/app/components/ProgramDetailsSection";
import type { ProgramDetail } from "@/lib/program-details";

export default async function GetGolfReadyLevel1() {
  // Fetch program data from database
  const program = await getProgramByCategory("get-golf-ready", "Level I");
  const sessions = program ? await getProgramSessions(program.id) : [];

  // If program doesn't exist in DB yet, show a message
  if (!program) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Program Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The &quot;Get Golf Ready (Level I)&quot; program hasn&apos;t been
            created in the database yet. Please create it in the admin panel
            first.
          </p>
          <p className="text-sm text-gray-500">
            Category:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              get-golf-ready
            </code>
            <br />
            Level:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">Level I</code>
          </p>
        </div>
      </div>
    );
  }

  const programPrice = parseFloat(program.price);

  // Parse details from database or use defaults
  // The details column now stores a JSON string with structured data
  const programDetails: ProgramDetail[] | string =
    program.details || DEFAULT_ADULT_PROGRAM_DETAILS;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{program.name}</h1>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-2">
              <Link
                href="/adult-programs/get-golf-ready-level-1"
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
              >
                GET GOLF READY PROGRAM (LEVEL I)
              </Link>
              <Link
                href="/adult-programs/get-golf-ready-level-2"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                GET GOLF READY PROGRAM (LEVEL II)
              </Link>
              <Link
                href="/adult-programs/short-game"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ADULT SHORT GAME SERIES
              </Link>
              <Link
                href="/adult-programs/women"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                GOLF FOR WOMEN PROGRAM
              </Link>
              <Link
                href="/adult-programs/private"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ADULT PRIVATE GOLF INSTRUCTION
              </Link>
              <Link
                href="/adult-programs/open-practice"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ADULT OPEN PRACTICE
              </Link>
            </div>

            {/* Left Content: Image, Description, Price */}
            <div className="lg:col-span-4 space-y-6">
              {/* Image */}
              <Image
                src={program.imageUrl || getGolfReadyLevel1}
                alt={program.name}
                width={400}
                height={300}
                className="w-full h-auto object-cover"
              />

              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Join us for our next{" "}
                  <strong className="text-gray-800">GET GOLF READY</strong>{" "}
                  program. Our PGA certified instructors will teach you the
                  basics so you can participate in a corporate outing, or simply
                  to create foundation to learn and enjoy golf.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {program.description}
                </p>
              </div>

              {/* Price & Purchase - Client Component */}
              <ProgramPurchaseSection
                programId={program.id}
                programName={program.name}
                programPrice={programPrice}
                duration={program.duration}
                sessions={sessions.map((s) => ({
                  id: s.id,
                  name: s.name,
                }))}
              />
            </div>

            {/* Right Content: Features & Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Program Features */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Program features:
                </h2>
                <div className="space-y-4">
                  {(
                    program.features || [
                      "Pitching, chipping and bunker play",
                      "Putting technique and reading greens",
                      "Full swing fundamentals",
                      'Learn the "lingo"',
                      "Club selections for golf course",
                      "Keeping score and navigating course",
                      "Flexible scheduling (April-October)",
                    ]
                  ).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2
                        className="text-green-600 shrink-0"
                        size={20}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Details - Uses structured data with icon mapping */}
              <ProgramDetailsSection details={programDetails} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
