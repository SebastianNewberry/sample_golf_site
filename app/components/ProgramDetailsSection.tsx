import {
  type ProgramDetail,
  getDetailIcon,
  getDetailTitle,
  parseDetails,
} from "@/lib/program-details";

interface ProgramDetailsSectionProps {
  /**
   * JSON string of program details, or already parsed array.
   */
  details: string | ProgramDetail[] | null;
  /**
   * Optional title override. Defaults to "Program details:"
   */
  title?: string;
  /**
   * Optional additional CSS classes for the container.
   */
  className?: string;
}

/**
 * Renders a list of program details with icons based on detail type.
 * Each detail type maps to a specific Lucide icon.
 */
export function ProgramDetailsSection({
  details,
  title = "Program details:",
  className = "",
}: ProgramDetailsSectionProps) {
  // Parse details if it's a string
  const parsedDetails: ProgramDetail[] =
    typeof details === "string"
      ? parseDetails(details)
      : Array.isArray(details)
        ? details
        : [];

  if (parsedDetails.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl p-8 shadow-sm ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      <div className="grid gap-4">
        {parsedDetails.map((detail, index) => {
          const IconComponent = getDetailIcon(detail.type);
          const detailTitle = getDetailTitle(detail.type);

          return (
            <div
              key={`${detail.type}-${index}`}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <IconComponent className="text-green-600 shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">{detailTitle}</h3>
                {detail.descriptions.map((desc, descIndex) => (
                  <p key={descIndex} className="text-sm text-gray-600">
                    {desc}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Default details for programs that don't have custom details set.
 * These provide a good fallback for the Get Golf Ready Level I program.
 */
export const DEFAULT_ADULT_PROGRAM_DETAILS: ProgramDetail[] = [
  {
    type: "all-inclusive",
    descriptions: [
      "Practice balls and green fees are included",
      "Equipment is provided free of charge",
    ],
  },
  {
    type: "class-size",
    descriptions: ["Class is limited to six students"],
  },
  {
    type: "duration",
    descriptions: ["Five (5) one hour range sessions"],
  },
];

export const DEFAULT_JUNIOR_PROGRAM_DETAILS: ProgramDetail[] = [
  {
    type: "instructor-ratio",
    descriptions: ["6:1 for personalized instruction"],
  },
  {
    type: "age-group",
    descriptions: [
      "Boys and Girls ages 7-17",
      "Juniors will be grouped by age and experience",
    ],
  },
  {
    type: "all-inclusive",
    descriptions: [
      "Practice balls and greens fees included",
      "Equipment is provided free of charge",
    ],
  },
  {
    type: "schedule",
    descriptions: ["Available April through October"],
  },
];

