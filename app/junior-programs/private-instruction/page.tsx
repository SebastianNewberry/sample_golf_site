"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Target,
  MapPin,
  Video,
  Award,
  Plus,
  Minus,
  Users2,
} from "lucide-react";
import Link from "next/link";
import privateInstruction from "@/public/junior_private_instruction.webp";
import Image from "next/image";

export default function JuniorPrivateGolfInstruction() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Junior Private Golf Instruction
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
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR DEVELOPMENTAL GOLF CAMP
              </Link>
              <Link
                href="/junior-programs/private-instruction"
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
              >
                JUNIOR PRIVATE GOLF INSTRUCTION
              </Link>
            </div>

            {/* Left Content: Image, Description, Price */}
            <div className="lg:col-span-4 space-y-6">
              {/* Image */}
              <Image
                src={privateInstruction}
                alt="Junior Private Golf Instruction"
                className="w-full h-auto object-cover"
              />

              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Video className="text-green-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">
                    PRIVATE LESSONS
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our junior private golf lesson offers individual instruction
                  with Paul Toski, PGA Professional. We start with an interview
                  about current state of your child's game and goals they aspire
                  to achieve in golf. High-speed video will be taken of their
                  swing and after a review of video, they will be introduced to
                  specific drills and training aids designed to improve their
                  golf skills. At the end of each lesson we will review the key
                  points, prioritize skills that still need development, and
                  together lay out a plan for practice and on course play.
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-green-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">
                    ON-COURSE COACHING
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Our on-course coaching session teaches your child how to take
                  their game from the practice area to the golf course. They
                  will learn under real playing conditions and receive
                  invaluable instruction on all aspects of their game, with
                  special emphasis on mental conditioning, shot selection, and
                  course management. On-course coaching is followed by a
                  30-minute evaluation and a detailed plan for improvement.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    JUNIOR PRIVATE GOLF INSTRUCTION
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    from $60.00
                  </p>
                </div>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Session:
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>Select Session</option>
                      <option>Private Lesson - 1/2 hour - $60</option>
                      <option>Private Lesson - 1 hour - $90</option>
                      <option>Series of 5 Lessons - $400</option>
                      <option>Series of 10 Lessons - $700</option>
                      <option>On-Course Coaching - 1 player - $250</option>
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
                  PURCHASE
                </Button>
              </div>
            </div>

            {/* Right Content: Features & Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Private Lessons Pricing */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Private Lessons Pricing:
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="text-green-600" size={20} />
                      <span className="font-semibold text-gray-800">
                        Private Lesson: 1/2 hour
                      </span>
                    </div>
                    <span className="text-xl font-bold text-green-700">
                      $60
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="text-green-600" size={20} />
                      <span className="font-semibold text-gray-800">
                        Private Lesson: 1 hour
                      </span>
                    </div>
                    <span className="text-xl font-bold text-green-700">
                      $90
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="text-green-600" size={20} />
                      <span className="font-semibold text-gray-800">
                        Series of 5 Private Lessons: 1 hour
                      </span>
                    </div>
                    <span className="text-xl font-bold text-green-700">
                      $400
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="text-green-600" size={20} />
                      <span className="font-semibold text-gray-800">
                        Series of 10 Private Lessons: 1 hour
                      </span>
                    </div>
                    <span className="text-xl font-bold text-green-700">
                      $700
                    </span>
                  </div>
                </div>
              </div>

              {/* On-Course Coaching Pricing */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  On-Course Coaching Pricing:
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users2 className="text-green-600" size={20} />
                      <span className="text-gray-700">
                        Nine (9) Hole Lesson: 1 player
                      </span>
                    </div>
                    <span className="font-bold text-green-700">$250</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users2 className="text-green-600" size={20} />
                      <span className="text-gray-700">
                        Nine (9) Hole Lesson: 2 players
                      </span>
                    </div>
                    <span className="font-bold text-green-700">$300</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users2 className="text-green-600" size={20} />
                      <span className="text-gray-700">
                        Nine (9) Hole Lesson: 3 players (two coaches)
                      </span>
                    </div>
                    <span className="font-bold text-green-700">$475</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users2 className="text-green-600" size={20} />
                      <span className="text-gray-700">
                        Nine (9) Hole Lesson: 4 players (two coaches)
                      </span>
                    </div>
                    <span className="font-bold text-green-700">$600</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-green-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Location</h2>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 font-semibold mb-1">
                    Sanctuary Lake Golf Course
                  </p>
                  <p className="text-gray-600">1450 East South Blvd</p>
                  <p className="text-gray-600">Troy, MI 48085</p>
                </div>
              </div>

              {/* Why Choose Private Instruction */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="text-green-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Why Choose Private Instruction?
                  </h2>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2
                      className="text-green-600 shrink-0 mt-0.5"
                      size={20}
                    />
                    <span className="text-gray-700">
                      Individual attention from PGA Professional
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2
                      className="text-green-600 shrink-0 mt-0.5"
                      size={20}
                    />
                    <span className="text-gray-700">
                      High-speed video swing analysis
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2
                      className="text-green-600 shrink-0 mt-0.5"
                      size={20}
                    />
                    <span className="text-gray-700">
                      Personalized improvement plans
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2
                      className="text-green-600 shrink-0 mt-0.5"
                      size={20}
                    />
                    <span className="text-gray-700">
                      Real on-course coaching experience
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
