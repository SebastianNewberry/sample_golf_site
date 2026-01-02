import {
  Award,
  Users,
  Calendar,
  Target,
  Clock,
  Video,
  MapPin,
  Phone,
  GraduationCap,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Standardized detail types for golf programs.
 * Each type maps to a specific icon and has a display title.
 */
export const PROGRAM_DETAIL_TYPES = {
  "all-inclusive": {
    icon: Award,
    title: "All-Inclusive",
  },
  "class-size": {
    icon: Users,
    title: "Class Size",
  },
  duration: {
    icon: Calendar,
    title: "Duration",
  },
  "age-group": {
    icon: Target,
    title: "Age Group",
  },
  schedule: {
    icon: Clock,
    title: "Schedule",
  },
  "video-analysis": {
    icon: Video,
    title: "Video Analysis",
  },
  "private-instruction": {
    icon: Users,
    title: "Private Instruction",
  },
  "customized-plan": {
    icon: Target,
    title: "Customized Plan",
  },
  location: {
    icon: MapPin,
    title: "Location",
  },
  equipment: {
    icon: Award,
    title: "Equipment",
  },
  "practice-balls": {
    icon: Target,
    title: "Practice Balls Included",
  },
  contact: {
    icon: Phone,
    title: "Contact",
  },
  "skill-level": {
    icon: GraduationCap,
    title: "Skill Level",
  },
  "instructor-ratio": {
    icon: Users,
    title: "Student to Instructor Ratio",
  },
  "course-play": {
    icon: Zap,
    title: "On-Course Play",
  },
  prerequisite: {
    icon: GraduationCap,
    title: "Prerequisite",
  },
} as const;

// Type for the detail type keys
export type ProgramDetailType = keyof typeof PROGRAM_DETAIL_TYPES;

// Array of all detail types for dropdown selection
export const DETAIL_TYPE_OPTIONS: { value: ProgramDetailType; label: string }[] = 
  Object.entries(PROGRAM_DETAIL_TYPES).map(([key, config]) => ({
    value: key as ProgramDetailType,
    label: config.title,
  }));

/**
 * A single program detail with a type and description lines.
 */
export interface ProgramDetail {
  type: ProgramDetailType;
  descriptions: string[];
}

/**
 * A single program feature (simple string).
 */
export type ProgramFeature = string;

/**
 * Get the icon component for a detail type.
 */
export function getDetailIcon(type: ProgramDetailType): LucideIcon {
  return PROGRAM_DETAIL_TYPES[type]?.icon ?? Award;
}

/**
 * Get the display title for a detail type.
 */
export function getDetailTitle(type: ProgramDetailType): string {
  return PROGRAM_DETAIL_TYPES[type]?.title ?? type;
}

/**
 * Parse JSON string to ProgramDetail array, with fallback.
 */
export function parseDetails(detailsJson: string | null): ProgramDetail[] {
  if (!detailsJson) return [];
  try {
    const parsed = JSON.parse(detailsJson);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is ProgramDetail =>
          typeof item === "object" &&
          item !== null &&
          typeof item.type === "string" &&
          Array.isArray(item.descriptions)
      );
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Stringify ProgramDetail array to JSON.
 */
export function stringifyDetails(details: ProgramDetail[]): string {
  return JSON.stringify(details);
}

