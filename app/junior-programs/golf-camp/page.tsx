"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Target,
  Award,
  MapPin,
  Clock,
} from "lucide-react";
import golfCamp from "@/public/junior_golf_camp.webp";
import Image from "next/image";
import Link from "next/link";

export default function JuniorGolfCamp() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Junior Golf Camp
            </h1>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-2">
              <Link
                href="/junior-programs/beginner-series"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR BEGINNER SERIES
              </Link>
              <Link
                href="/junior-programs/developmental-series"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR DEVELOPMENTAL SERIES
              </Link>
              <Link
                href="/junior-programs/golf-camp"
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
              >
                JUNIOR GOLF CAMP
              </Link>
              <Link
                href="/junior-programs/developmental-camp"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR DEVELOPMENTAL GOLF CAMP
              </Link>
              <Link
                href="/junior-programs/private-instruction"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR PRIVATE GOLF INSTRUCTION
              </Link>
            </div>

            {/* Left Content: Image, Description, Price */}
            <div className="lg:col-span-4 space-y-6">
              {/* Image */}
              <Image
                src={golfCamp}
                alt="Junior Golf Camp"
                className="w-full h-auto object-cover"
              />

              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our{" "}
                  <strong className="text-gray-800">Junior Golf Camp</strong> is
                  designed for the "new junior golfer" and for those players
                  aspiring to expand their golf skills and improve on-course
                  play.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Campers will spend the week with our coaching staff receiving
                  personalized instruction on all aspects of game, with emphasis
                  placed on golf fundamentals as well as fun.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Daily camp activities include planned practices and challenges
                  and skill-development inspired games all designed to teach
                  juniors what they need to know to have fun and feel confident
                  on course. This is a great way to get kids involved in golf.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    JUNIOR GOLF CAMP
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    $200.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Week-long camp</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dates/Sessions:
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option>Select Dates/Sessions</option>
                    <option>Week 1: June 16-20, 2025</option>
                    <option>Week 2: June 23-27, 2025</option>
                    <option>Week 3: July 7-11, 2025</option>
                    <option>Week 4: July 14-18, 2025</option>
                  </select>
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold">
                  PURCHASE
                </Button>
              </div>
            </div>

            {/* Right Content: Features & Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Skills Learned */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Campers will learn:
                </h2>
                <div className="space-y-3">
                  {[
                    "Chipping and pitching skills",
                    "Putting technique and reading greens",
                    "Full swing fundamentals",
                    "Bunker play",
                    "Rules and etiquette",
                  ].map((skill, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2
                        className="text-green-600 shrink-0"
                        size={20}
                      />
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Camp Details */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Camp details:
                </h2>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Target className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Age Group</h3>
                      <p className="text-sm text-gray-600">
                        Boys and Girls ages 8-12
                      </p>
                      <p className="text-sm text-gray-600">
                        Players younger than age 8 will be evaluated on skill
                        level and course experience for inclusion
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Users className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Grouping</h3>
                      <p className="text-sm text-gray-600">
                        Juniors will be grouped by age and playing level
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Users className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Low student to instructor ratio
                      </h3>
                      <p className="text-sm text-gray-600">
                        10:1 for personalized instruction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Award className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        All-Inclusive
                      </h3>
                      <p className="text-sm text-gray-600">
                        Equipment is provided free of charge
                      </p>
                      <p className="text-sm text-gray-600">
                        Practice balls are included
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Clock className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Schedule</h3>
                      <p className="text-sm text-gray-600">
                        Monday through Friday 8:30-11:00am
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Location</h3>
                      <p className="text-sm text-gray-600">
                        Sanctuary Lake Golf Course
                      </p>
                      <p className="text-sm text-gray-600">
                        1450 East South Blvd, Troy, MI 48085
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
