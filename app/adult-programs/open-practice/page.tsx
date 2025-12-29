"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Target,
  Award,
  Calendar,
  Phone,
} from "lucide-react";
import openPractice from "@/public/adult_open_practice.webp";
import Image from "next/image";

export default function AdultOpenPractice() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Adult Open Practice
            </h1>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-2">
              <a
                href="/adult-programs/get-golf-ready-level-1"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                GET GOLF READY PROGRAM (LEVEL I)
              </a>
              <a
                href="/adult-programs/get-golf-ready-level-2"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                GET GOLF READY PROGRAM (LEVEL II)
              </a>
              <a
                href="/adult-programs/short-game"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ADULT SHORT GAME SERIES
              </a>
              <a
                href="/adult-programs/women"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                GOLF FOR WOMEN PROGRAM
              </a>
              <a
                href="/adult-programs/private"
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ADULT PRIVATE GOLF INSTRUCTION
              </a>
              <a
                href="/adult-programs/open-practice"
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
              >
                ADULT OPEN PRACTICE
              </a>
            </div>

            {/* Left Content: Image, Description, Price */}
            <div className="lg:col-span-4 space-y-6">
              {/* Image */}
              <Image
                src={openPractice}
                alt="Adult Open Practice"
                className="w-full h-auto object-cover"
              />
              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-green-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">
                    ABOUT THE PROGRAM
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Our ADULT OPEN PRACTICE program is designed for the
                  intermediate to advanced player, specifically those who have
                  completed our Get Golf Ready Level I & II and Short Game
                  Series programs that want to continue to train with our
                  coaching staff and improve their on-course play.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  During these one hour supervised coaching sessions, your
                  skills will be assessed and you will be introduced to specific
                  drills to help you achieve your goals. Our coaching staff has
                  worked together for many years and we are dedicated to
                  ensuring that you are practicing quality not just quantity.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Adult Open Practice
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    $30.00
                  </p>
                </div>

                <div className="space-y-2">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold">
                    PURCHASE
                  </Button>
                  <a
                    href="tel:+12485633561"
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 font-semibold rounded-lg transition-colors"
                  >
                    Call to Reserve Spot
                  </a>
                </div>
              </div>
            </div>

            {/* Right Content: Features, Schedule, Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Program Features */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Program features:
                </h2>
                <div className="space-y-4">
                  {[
                    "Short game coaching",
                    "Full swing coaching",
                    "Learn how to practice for lasting improvement",
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

              {/* Schedule */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-green-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">
                    2025 Class Schedule:
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Award className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        April through October
                      </h3>
                      <p className="text-sm text-gray-600">
                        Saturday at 11:00 am
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
                        Limited Class Size
                      </h3>
                      <p className="text-sm text-gray-600">
                        Class is limited to four (4) students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Target className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Practice Balls Included
                      </h3>
                      <p className="text-sm text-gray-600">
                        All practice balls are provided
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Award className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        One-Hour Sessions
                      </h3>
                      <p className="text-sm text-gray-600">
                        One (1) hour coaching session
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <Phone className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Contact Paul Toski to reserve a spot
                    </p>
                    <a
                      href="tel:+12485633561"
                      className="text-lg font-bold text-green-700 hover:text-green-800"
                    >
                      (248) 563-3561
                    </a>
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
