"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Target,
  Award,
  Calendar,
  Clock,
} from "lucide-react";
import shortGame from "@/public/adult_short_game.webp";
import Image from "next/image";
import Link from "next/link";

export default function AdultShortGameSeries() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Adult Short Game Series
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
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
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
                src={shortGame}
                alt="Adult Short Game Series"
                className="w-full h-auto object-cover"
              />

              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our{" "}
                  <strong className="text-gray-800">
                    ADULT SHORT GAME SERIES
                  </strong>{" "}
                  is focused exclusively on developing your short game technique
                  by learning the skills and understanding the strategies that
                  form the basis for improved scoring.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you really want to lower your scores, this is the program
                  for you! Our class lasts for three (3) weeks and includes
                  personalized instruction on all the shots within 100 yards of
                  the hole. To help you optimize your short game performance, we
                  will evaluate your current wedges and make recommendations
                  with goal of providing you with specifications and loft
                  selection.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Adult Short Game Series
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    $100.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Three 1-hour sessions
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 h-10 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                      -
                    </button>
                    <span className="flex-1 text-center font-semibold text-lg">
                      1
                    </span>
                    <button className="flex-1 h-10 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                      +
                    </button>
                  </div>
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
                    "Chipping fundamentals",
                    "Green side pitch shot techniques",
                    "Developing wedge shot distance control",
                    "Bunker play",
                    "Putting technique and green reading skills",
                    "Wedge Fitting by a Certified Titleist Club Fitter",
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
                        Small Class Size
                      </h3>
                      <p className="text-sm text-gray-600">
                        Class is limited to four (4) students
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
                        Practice balls are included
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Duration</h3>
                      <p className="text-sm text-gray-600">
                        Three (3) one hour sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Clock className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">Schedule</h3>
                      <p className="text-sm text-gray-600">
                        Sessions are held Thursday at 6:00 PM and Saturday at
                        10:00 AM
                      </p>
                      <p className="text-sm text-gray-600">
                        Please call or text Paul Toski at (248) 563-3561
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: toskigolfacademy@gmail.com to schedule a series
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
