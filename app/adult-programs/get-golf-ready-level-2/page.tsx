"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Target,
  Award,
  Calendar,
  Video,
} from "lucide-react";
import getGolfReadyLevel2 from "@/public/golf_ready_level2.webp";
import Image from "next/image";
import Link from "next/link";

export default function GetGolfReadyLevel2() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Get Golf Ready (Level II)
            </h1>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-2">
              <Link
                href="/adult-programs/get-golf-ready-level-1"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                GET GOLF READY PROGRAM (LEVEL I)
              </Link>
              <Link
                href="/adult-programs/get-golf-ready-level-2"
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
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
                src={getGolfReadyLevel2}
                alt="Get Golf Ready Level 1"
                className="w-full h-auto object-cover"
              />

              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our award winning{" "}
                  <strong className="text-gray-800">
                    GET GOLF READY (LEVEL II)
                  </strong>{" "}
                  program is designed as a next step for beginner golfer and for
                  the more experienced player interested in taking their game to
                  the next level.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This program builds on the principles learned in{" "}
                  <strong className="text-gray-800">
                    GET GOLF READY (LEVEL I)
                  </strong>
                  . Each class lasts for four (4) weeks and provides students
                  with personalized instruction. Students will be introduced to
                  drills, practice routines, and on-course coaching is included
                  to utilize skills learned on the practice tee and short game
                  area.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    GET GOLF READY - LEVEL II
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    $120.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Four 1-hour sessions
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dates/Sessions:
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option>Select Dates/Sessions</option>
                    <option>Session 1: April 2025</option>
                    <option>Session 2: May 2025</option>
                    <option>Session 3: June 2025</option>
                  </select>
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold">
                  PURCHASE
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
                  {[
                    "Pitching, chipping and bunker play",
                    "Putting technique and reading greens",
                    "Full swing fundamentals",
                    "Comprehensive video analysis of your golf swing",
                    "Navigating course",
                    "Flexible scheduling (April-October)",
                  ].map((feature, index) => (
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

              {/* Program Details */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Program details:
                </h2>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Award className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        All-Inclusive
                      </h3>
                      <p className="text-sm text-gray-600">
                        Practice balls and green fees are included
                      </p>
                      <p className="text-sm text-gray-600">
                        Equipment is provided at no charge
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Users className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Small Class Size
                      </h3>
                      <p className="text-sm text-gray-600">
                        Class limited to six students per class
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Duration</h3>
                      <p className="text-sm text-gray-600">
                        Four (4) one hour sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Video className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Video Analysis
                      </h3>
                      <p className="text-sm text-gray-600">
                        Comprehensive video analysis of your golf swing
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
