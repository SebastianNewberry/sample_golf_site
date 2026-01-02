/**
 * Database Seed Script for Programs
 *
 * Run this script to seed your database with initial program data:
 * npx tsx db/seed-programs.ts
 *
 * Make sure to have your DATABASE_URL environment variable set.
 */

import { db } from "./index";
import { program, programSession } from "./schema";
import type { ProgramDetail } from "@/lib/program-details";
import type { SessionSchedule } from "@/lib/session-schedule";

// Helper to stringify details
function detailsToJson(details: ProgramDetail[]): string {
  return JSON.stringify(details);
}

// Helper to stringify schedule
function scheduleToJson(schedule: SessionSchedule): string {
  return JSON.stringify(schedule);
}

const programs = [
  // Adult Programs
  {
    name: "Get Golf Ready (Level I)",
    description:
      "A PGA National program that we host each year is designed for beginners to teach you everything you'll need to know to step onto a golf course and get out to play with confidence. Each class lasts for five (5) weeks and provides basic skills instruction as well as information regarding the background of the game's rules, etiquette and values.",
    type: "adult" as const,
    category: "get-golf-ready",
    level: "Level I",
    price: "150.00",
    duration: "Five 1-hour range sessions",
    capacity: 6,
    imageUrl: "/golf_ready_level1.webp",
    features: [
      "Pitching, chipping and bunker play",
      "Putting technique and reading greens",
      "Full swing fundamentals",
      'Learn the "lingo"',
      "Club selections for golf course",
      "Keeping score and navigating course",
      "Flexible scheduling (April-October)",
    ],
    details: detailsToJson([
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
    ]),
  },
  {
    name: "Get Golf Ready (Level II)",
    description:
      "Continue your golf journey with Level II. Building on the fundamentals from Level I, this program focuses on course play, strategy, and advanced techniques to take your game to the next level.",
    type: "adult" as const,
    category: "get-golf-ready",
    level: "Level II",
    price: "120.00",
    duration: "Four 1-hour sessions",
    capacity: 6,
    imageUrl: "/golf_ready_level2.webp",
    features: [
      "Pitching, chipping and bunker play",
      "Putting technique and reading greens",
      "Full swing fundamentals",
      "Comprehensive video analysis of your golf swing",
      "Navigating course",
      "Flexible scheduling (April-October)",
    ],
    details: detailsToJson([
      {
        type: "all-inclusive",
        descriptions: [
          "Practice balls and green fees are included",
          "Equipment is provided at no charge",
        ],
      },
      {
        type: "class-size",
        descriptions: ["Class limited to six students per class"],
      },
      {
        type: "duration",
        descriptions: ["Four (4) one hour sessions"],
      },
      {
        type: "video-analysis",
        descriptions: ["Comprehensive video analysis of your golf swing"],
      },
    ]),
  },
  {
    name: "Adult Short Game Series",
    description:
      "Master the short game - the key to lower scores. This specialized program focuses on putting, chipping, pitching, and bunker play.",
    type: "adult" as const,
    category: "short-game",
    level: null,
    price: "100.00",
    duration: "Three 1-hour sessions",
    capacity: 4,
    imageUrl: "/adult_short_game.webp",
    features: [
      "Chipping fundamentals",
      "Green side pitch shot techniques",
      "Developing wedge shot distance control",
      "Bunker play",
      "Putting technique and green reading skills",
      "Wedge Fitting by a Certified Titleist Club Fitter",
    ],
    details: detailsToJson([
      {
        type: "class-size",
        descriptions: ["Class is limited to four (4) students"],
      },
      {
        type: "all-inclusive",
        descriptions: ["Practice balls are included"],
      },
      {
        type: "duration",
        descriptions: ["Three (3) one hour sessions"],
      },
      {
        type: "schedule",
        descriptions: [
          "Sessions are held Thursday at 6:00 PM and Saturday at 10:00 AM",
          "Please call or text Paul Toski at (248) 563-3561",
          "Email: toskigolfacademy@gmail.com to schedule a series",
        ],
      },
    ]),
  },
  {
    name: "Golf for Women",
    description:
      "A welcoming program designed specifically for women who want to learn golf in a comfortable, supportive environment. Each class lasts for five (5) weeks and provides personalized instruction as well as information regarding the background of the game's rules, etiquette and values.",
    type: "adult" as const,
    category: "women",
    level: null,
    price: "150.00",
    duration: "Five 1-hour range sessions",
    capacity: 6,
    imageUrl: "/golf_for_women.webp",
    features: [
      "Pitching, chipping and bunker play",
      "Putting technique and green reading",
      "Full swing fundamentals",
      'Learn to "lingo"',
      "Club selections for golf course",
      "Keeping score and navigating course",
      "Flexible scheduling (April-October)",
    ],
    details: detailsToJson([
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
    ]),
  },
  {
    name: "Adult Private Golf Instruction",
    description:
      "One-on-one instruction tailored to your specific goals and needs. Work directly with a PGA professional to improve your game. High-speed video will be taken of your swing and after a review of the video, you will be introduced to specific drills and training aids to improve your golf skills.",
    type: "adult" as const,
    category: "private",
    level: null,
    price: "70.00",
    duration: "1-hour session",
    capacity: 1,
    imageUrl: "/adult_private_instruction.webp",
    features: [
      "Individual instruction with Paul Toski, PGA Professional",
      "Interview about current state of your game",
      "Identify physical limitations affecting swing",
      "Goals assessment for personalized instruction",
      "High-speed video swing analysis",
      "Specific drills and training aids",
      "Practice and on-course play plan",
    ],
    details: detailsToJson([
      {
        type: "private-instruction",
        descriptions: ["One-on-one coaching sessions"],
      },
      {
        type: "video-analysis",
        descriptions: ["High-speed video swing review"],
      },
      {
        type: "customized-plan",
        descriptions: ["Personalized practice and on-course play plan"],
      },
    ]),
  },
  {
    name: "Adult Open Practice",
    description:
      "Access our premium practice facilities with supervised open practice sessions. Designed for the intermediate to advanced player who wants to continue training with our coaching staff.",
    type: "adult" as const,
    category: "open-practice",
    level: null,
    price: "30.00",
    duration: "1-hour session",
    capacity: 4,
    imageUrl: "/adult_open_practice.webp",
    features: [
      "Short game coaching",
      "Full swing coaching",
      "Learn how to practice for lasting improvement",
    ],
    details: detailsToJson([
      {
        type: "class-size",
        descriptions: ["Class is limited to four (4) students"],
      },
      {
        type: "practice-balls",
        descriptions: ["All practice balls are provided"],
      },
      {
        type: "duration",
        descriptions: ["One (1) hour coaching session"],
      },
      {
        type: "schedule",
        descriptions: ["April through October", "Saturday at 11:00 am"],
      },
    ]),
  },
  // Junior Programs
  {
    name: "Junior Beginner Series",
    description:
      "Introduction to golf for young players. Learn the fundamentals in a fun, engaging environment.",
    type: "junior" as const,
    category: "beginner-series",
    level: null,
    price: "120.00",
    duration: "Four 1-hour sessions",
    capacity: 6,
    imageUrl: "/junior_beginner_series.webp",
    features: [
      "Chipping and pitching skills",
      "Putting technique and reading greens",
      "Full swing fundamentals",
      "Bunker play",
      "Keeping score and navigating the course",
    ],
    details: detailsToJson([
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
    ]),
  },
  {
    name: "Junior Developmental Series",
    description:
      "For young golfers ready to take their game to the next level. Focus on skill development and course play.",
    type: "junior" as const,
    category: "developmental-series",
    level: null,
    price: "125.00",
    duration: "Four 1.5-hour sessions",
    capacity: 6,
    imageUrl: "/junior_development_series.gif",
    features: [
      "Advanced player curriculum developed by PGA Professionals",
      "Full swing and short game comprehensive fundamentals",
      "On-course instruction for approved players",
      "Comprehensive V-1 Video swing analysis",
      "Club fitting and equipment evaluation with TrackMan",
    ],
    details: detailsToJson([
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
    ]),
  },
  {
    name: "Junior Golf Camp",
    description:
      "Intensive golf camp experience. Full days of instruction, games, and fun.",
    type: "junior" as const,
    category: "golf-camp",
    level: null,
    price: "299.00",
    duration: "5-day camp (9am-3pm)",
    capacity: 12,
    imageUrl: "/junior_golf_camp.webp",
    features: [
      "Full day program (9am-3pm)",
      "All skill levels welcome",
      "Games and competitions",
      "On-course play daily",
      "Lunch included",
    ],
    details: detailsToJson([
      {
        type: "age-group",
        descriptions: ["Ages 7-14"],
      },
      {
        type: "all-inclusive",
        descriptions: ["All equipment and lunch included"],
      },
      {
        type: "course-play",
        descriptions: ["End-of-camp tournament"],
      },
    ]),
  },
  {
    name: "Junior Private Instruction",
    description:
      "Individual instruction for young golfers who want personalized coaching.",
    type: "junior" as const,
    category: "private-instruction",
    level: null,
    price: "65.00",
    duration: "45-minute session",
    capacity: 1,
    imageUrl: "/junior_private_instruction.webp",
    features: [
      "One-on-one instruction",
      "Custom lesson plan",
      "Video analysis",
      "Progress tracking",
    ],
    details: detailsToJson([
      {
        type: "age-group",
        descriptions: ["Ages 5-17"],
      },
      {
        type: "practice-balls",
        descriptions: ["Practice balls included"],
      },
      {
        type: "private-instruction",
        descriptions: ["Package pricing available"],
      },
    ]),
  },
];

async function seed() {
  console.log("🌱 Seeding programs...");

  for (const programData of programs) {
    try {
      const [createdProgram] = await db
        .insert(program)
        .values(programData)
        .returning();

      console.log(`✅ Created program: ${createdProgram.name}`);

      // Create some sample sessions for group programs
      if (
        programData.capacity > 1 &&
        programData.category !== "open-practice"
      ) {
        // Define schedule based on program type
        const isCamp = programData.category === "golf-camp";
        const schedule: SessionSchedule = isCamp
          ? {
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "09:00",
              endTime: "15:00",
            } // Weekdays 9am-3pm
          : { daysOfWeek: [6], startTime: "09:00", endTime: "10:00" }; // Saturdays 9-10am

        const sessions = [
          {
            programId: createdProgram.id,
            name: "Session 1: April 2025",
            startDate: new Date("2025-04-01"),
            endDate: new Date("2025-04-30"),
            schedule: scheduleToJson(schedule),
            capacity: programData.capacity,
            isActive: true,
          },
          {
            programId: createdProgram.id,
            name: "Session 2: May 2025",
            startDate: new Date("2025-05-01"),
            endDate: new Date("2025-05-31"),
            schedule: scheduleToJson(schedule),
            capacity: programData.capacity,
            isActive: true,
          },
          {
            programId: createdProgram.id,
            name: "Session 3: June 2025",
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-06-30"),
            schedule: scheduleToJson(schedule),
            capacity: programData.capacity,
            isActive: true,
          },
        ];

        for (const sessionData of sessions) {
          await db.insert(programSession).values(sessionData);
        }
        console.log(`   📅 Created 3 sessions for ${createdProgram.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating program ${programData.name}:`, error);
    }
  }

  console.log("\n✨ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
