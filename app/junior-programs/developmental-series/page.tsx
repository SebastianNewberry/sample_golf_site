"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Target,
  Award,
  Video,
  Zap,
  Plus,
  Minus,
} from "lucide-react";
import developmentalSeries from "@/public/junior_development_series.gif";
import Link from "next/link";
import Image from "next/image";

export default function JuniorDevelopmentalSeries() {
  const [quantity, setQuantity] = React.useState(1);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Junior Developmental Series
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
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
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
                src={developmentalSeries}
                alt="Junior Developmental Series"
                className="w-full h-auto object-cover"
              />

              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our{" "}
                  <strong className="text-gray-800">
                    Junior Developmental Series
                  </strong>{" "}
                  is designed for intermediate to advanced junior golfers
                  looking to expand their golf skills and improve on-course
                  play, and for those players who aspire to play or are already
                  playing competitive golf.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The{" "}
                  <strong className="text-gray-800">
                    Junior Developmental Series
                  </strong>{" "}
                  builds on the principles learned in{" "}
                  <strong className="text-gray-800">
                    Junior Beginner Series
                  </strong>
                  .
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You can choose either a package of five (5) or fifteen (15)
                  two-hour supervised practice sessions. A personalized
                  improvement plan will be developed for each student based on
                  his or her goals, ability and commitment level. The plan
                  includes: prioritizing skills that still need development,
                  planned practices and drills, on-course strategy and
                  management, and monitoring results.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    JUNIOR DEVELOPMENTAL SERIES
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    from $125.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Two-hour supervised sessions
                  </p>
                </div>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time/Sessions:
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>Select Time/Sessions</option>
                      <option>5 Sessions - $125.00</option>
                      <option>15 Sessions - $325.00</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-semibold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold">
                  ADD TO CART
                </Button>
              </div>
            </div>

            {/* Right Content: Features & Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Program Features */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Program features:
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
                    <Target className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Full swing and short game
                      </h3>
                      <p className="text-sm text-gray-600">
                        Comprehensive fundamentals instruction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Award className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        On-course instruction
                      </h3>
                      <p className="text-sm text-gray-600">
                        For approved players with emphasis on course management
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Video className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Comprehensive V-1 Video swing analysis
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Target className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Club fitting and equipment evaluation
                      </h3>
                      <p className="text-sm text-gray-600">
                        TracMan launch monitor analysis included
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Details */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Program details:
                </h2>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Users className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Low student to instructor ratio
                      </h3>
                      <p className="text-sm text-gray-600">
                        6:1 for personalized instruction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Target className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Age Group</h3>
                      <p className="text-sm text-gray-600">
                        Boys and Girls ages 9-17
                      </p>
                      <p className="text-sm text-gray-600">
                        Players younger than age 9 will be evaluated on skill
                        level and course experience for inclusion
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Award className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Skill-Based Grouping
                      </h3>
                      <p className="text-sm text-gray-600">
                        Juniors will be grouped by age and playing level
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <CheckCircle2
                      className="text-green-600 shrink-0"
                      size={24}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        All-Inclusive
                      </h3>
                      <p className="text-sm text-gray-600">
                        Practice balls and green fees are included
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <CheckCircle2
                      className="text-green-600 shrink-0"
                      size={24}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Player Requirements
                      </h3>
                      <p className="text-sm text-gray-600">
                        All players must be able to carry or cart their own
                        clubs, make club selections and keep score
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
