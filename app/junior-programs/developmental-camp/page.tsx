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
  Video,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import developmentalCamp from "@/public/junior_golf_camp.webp";
import Image from "next/image";

export default function JuniorDevelopmentalGolfCamp() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Junior Developmental Golf Camp
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
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR GOLF CAMP
              </Link>
              <Link
                href="/junior-programs/developmental-camp"
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
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
                src={developmentalCamp}
                alt="Junior Developmental Golf Camp"
                className="w-full h-auto object-cover"
              />

              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our{" "}
                  <strong className="text-gray-800">
                    Junior Developmental Golf Camp
                  </strong>{" "}
                  is designed for juniors who are looking to learn and for those
                  inspired to further develop their technical and playing
                  skills, in order to identify and reach their full potential.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  During week, campers participate in planned practice sessions
                  on the full swing and short game fundamental skills needed to
                  play great golf. These coaching sessions are designed to teach
                  new skills and challenge players to improve their existing
                  technical skills.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Juniors will also learn our essential playing skills, learn
                  how to practice them and then integrate them into their game
                  on the golf course. These skills teach juniors how to better
                  manage their mental and emotional state on the golf course, so
                  they will have fun and feel more confident playing. Each day
                  will include a mixture of presentations, practice and
                  on-course play and coaching.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    JUNIOR DEVELOPMENTAL GOLF CAMP
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    $450.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Week-long camp with daily 9-hole play
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dates/Sessions:
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option>Select Dates/Sessions</option>
                    <option>Week 1: June 16-20, 2025</option>
                    <option>Week 2: July 21-25, 2025</option>
                    <option>Week 3: August 4-8, 2025</option>
                  </select>
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold">
                  PURCHASE
                </Button>
              </div>
            </div>

            {/* Right Content: Features & Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Camp Highlights */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Camp Highlights:
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Zap className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Advanced player curriculum
                      </h3>
                      <p className="text-sm text-gray-600">
                        Developed and delivered by PGA Professionals
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Low student to instructor ratio
                      </h3>
                      <p className="text-sm text-gray-600">
                        5:1 allowing for personalized instruction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Trophy className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Daily on-course play
                      </h3>
                      <p className="text-sm text-gray-600">
                        9 holes of golf, daily, including on-course instruction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Video className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Comprehensive V-1 video swing analysis
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Target className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        TracMan launch monitor evaluation
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Award className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Club fitting and equipment evaluation
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Camp Details */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Camp Details:
                </h2>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Target className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Age Group</h3>
                      <p className="text-sm text-gray-600">
                        Boys and Girls ages 9-17
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Users className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Grouping</h3>
                      <p className="text-sm text-gray-600">
                        Juniors will be grouped by age and experience level
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Trophy className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Tournament
                      </h3>
                      <p className="text-sm text-gray-600">
                        Golf Tournament with awards on Friday
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Clock className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Schedule</h3>
                      <p className="text-sm text-gray-600">
                        Monday through Friday 1:00-5:00pm
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
