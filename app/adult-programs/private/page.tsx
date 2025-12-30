"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Target,
  Award,
  Video,
  Calendar,
  Plus,
  Minus,
} from "lucide-react";
import privateInstruction from "@/public/adult_private_instruction.webp";
import Link from "next/link";
import Image from "next/image";
export default function AdultPrivateGolfInstruction() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Adult Private Golf Instruction
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
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
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
                src={privateInstruction}
                alt="Adult Private Golf Instruction"
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
                <p className="text-gray-700 leading-relaxed">
                  Our private golf lesson offers individual instruction with
                  Paul Toski, PGA Professional. We start with an interview about
                  current state of your game, identify any physical limitations
                  that may affect your ability to swing, and goals you aspire to
                  achieve in golf.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  High-speed video will be taken of your swing and after a
                  review of the video, you will be introduced to specific drills
                  and training aids to improve your golf skills. At the end of
                  each lesson we will review the key points, prioritize skills
                  that still need to be developed, and together lay out a plan
                  for practice and on-course play.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Adult Private Golf Instruction
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    from $70.00
                  </p>
                </div>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session:
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>Select Session</option>
                      <option>Private Lesson - 1 hour - $90</option>
                      <option>Private Lesson - 1/2 hour - $70</option>
                      <option>Series of 5 Lessons - $425</option>
                      <option>Series of 10 Lessons - $700</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex-1 h-10 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="flex-1 text-center font-semibold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex-1 h-10 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold">
                    PURCHASE
                  </Button>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold">
                    SCHEDULE A LESSON
                  </Button>
                </div>
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
                    "Individual instruction with Paul Toski, PGA Professional",
                    "Interview about current state of your game",
                    "Identify physical limitations affecting swing",
                    "Goals assessment for personalized instruction",
                    "High-speed video swing analysis",
                    "Specific drills and training aids",
                    "Practice and on-course play plan",
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
                    <Users className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Private Instruction
                      </h3>
                      <p className="text-sm text-gray-600">
                        One-on-one coaching sessions
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
                        High-speed video swing review
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Target className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Customized Plan
                      </h3>
                      <p className="text-sm text-gray-600">
                        Personalized practice and on-course play plan
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
