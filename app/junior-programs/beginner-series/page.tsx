"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, Target, Award, Calendar } from "lucide-react";
import beginnerSeries from "@/public/junior_beginner_series.webp";
import Image from "next/image";
import Link from "next/link";
import { JuniorSeriesRegistrationForm } from "@/app/components/forms/JuniorSeriesRegistrationForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function JuniorBeginnerSeries() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Junior Beginner Series
            </h1>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-2">
              <Link
                href="/junior-programs/beginner-series"
                className="block bg-white border-l-4 border-orange-500 px-4 py-3 text-sm font-bold text-gray-800"
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
                className="block bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                JUNIOR PRIVATE GOLF INSTRUCTION
              </Link>
            </div>

            {/* Left Content: Image, Description, Price */}
            <div className="lg:col-span-4 space-y-6">
              {/* Image */}
              <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={beginnerSeries}
                  alt="Junior Beginner Series"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our{" "}
                  <strong className="text-gray-800">
                    Junior Beginner Series
                  </strong>{" "}
                  is specially designed for the "new junior golfer" and for
                  those still developing skills with the goal of becoming
                  independent on-course players.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Each series includes six (6) one-hour supervised practice
                  sessions (including on-course experience for approved
                  players). This program builds the foundation for a lifetime of
                  golf by introducing juniors the games' fundamentals, rules and
                  etiquette.
                </p>
              </div>

              {/* Price & Purchase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    JUNIOR BEGINNER SERIES
                  </h3>
                  <p className="text-4xl font-bold text-green-700 mt-2">
                    $150.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Six 1-hour sessions
                  </p>
                </div>

                <div className="mt-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        PURCHASE
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Registration Form</DialogTitle>
                        <DialogDescription>
                          Junior Beginner Series - $150.00
                        </DialogDescription>
                      </DialogHeader>
                      <JuniorSeriesRegistrationForm
                        programId="junior-beginner-series"
                        programName="Junior Beginner Series"
                        programPrice="$150.00"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Right Content: Features & Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Skills Learned */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Your child will learn:
                </h2>
                <div className="space-y-3">
                  {[
                    "Chipping and pitching skills",
                    "Putting technique and reading greens",
                    "Full swing fundamentals",
                    "Bunker play",
                    "Keeping score and navigating the course",
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
                        Boys and Girls ages 7-17
                      </p>
                      <p className="text-sm text-gray-600">
                        Juniors will be grouped by age and experience
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
                        Practice balls and greens fees included
                      </p>
                      <p className="text-sm text-gray-600">
                        Equipment is provided free of charge
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="text-green-600 shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Flexible Scheduling
                      </h3>
                      <p className="text-sm text-gray-600">
                        Available April through October
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
