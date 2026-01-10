import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  Sun,
  Snowflake,
  Home,
  Users,
  Calendar,
  Share2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone size={22} className="text-golf-orange" />
                <h3 className="text-xl font-bold text-golf-orange">
                  Contact Us
                </h3>
              </div>
              <div className="space-y-3">
                <a
                  href="tel:+12485633561"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <Phone
                    size={18}
                    className="text-golf-green group-hover:scale-110 transition-transform"
                  />
                  <span>+1 (248) 563-3561</span>
                </a>
                <a
                  href="mailto:toskigolfacademy@gmail.com"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <Mail
                    size={18}
                    className="text-golf-green group-hover:scale-110 transition-transform"
                  />
                  <span>toskigolfacademy@gmail.com</span>
                </a>
              </div>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 tracking-wide uppercase font-semibold shadow-lg hover:shadow-xl transition-all">
              Get in Touch
            </Button>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={22} className="text-golf-orange" />
              <h3 className="text-xl font-bold text-golf-orange">
                Our Locations
              </h3>
            </div>
            <div className="space-y-4">
              {/* Summer Location */}
              <a
                href="https://maps.google.com/?q=Sanctuary+Lake+Golf+Course+1450+East+South+Blvd+Troy+MI+48085"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50">
                  <Sun
                    size={18}
                    className="text-orange-500 group-hover:scale-110 transition-transform shrink-0 mt-1"
                  />
                  <div className="space-y-1">
                    <p className="font-semibold text-orange-400 text-sm uppercase tracking-wide">
                      Summer
                    </p>
                    <p className="text-base">Sanctuary Lake Golf Course</p>
                    <p className="text-sm">
                      1450 East South Blvd, Troy, MI 48085
                    </p>
                  </div>
                </div>
              </a>

              {/* Winter Location */}
              <a
                href="https://maps.google.com/?q=Evolution+SportsPlex+141+South+Opdyke+Rd+Auburn+Hills+MI+48326"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors p-3 rounded-lg bg-green-900/30 hover:bg-green-900/50">
                  <Snowflake
                    size={18}
                    className="text-blue-300 group-hover:scale-110 transition-transform shrink-0 mt-1"
                  />
                  <div className="space-y-1">
                    <p className="font-semibold text-blue-300 text-sm uppercase tracking-wide">
                      Winter
                    </p>
                    <p className="text-base">Evolution SportsPlex</p>
                    <p className="text-sm">
                      141 South Opdyke Rd, Auburn Hills, MI 48326
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={22} className="text-golf-orange" />
              <h3 className="text-xl font-bold text-golf-orange">
                Quick Links
              </h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 text-gray-300 hover:text-white hover:translate-x-2 transition-all text-base group"
              >
                <Home
                  size={16}
                  className="text-golf-green group-hover:scale-110 transition-transform"
                />
                Home
              </Link>
              <Link
                href="/adult-programs/get-golf-ready-level-1"
                className="flex items-center gap-3 text-gray-300 hover:text-white hover:translate-x-2 transition-all text-base group"
              >
                <Users
                  size={16}
                  className="text-golf-green group-hover:scale-110 transition-transform"
                />
                Adult Programs
              </Link>
              <Link
                href="/junior-programs/beginner-series"
                className="flex items-center gap-3 text-gray-300 hover:text-white hover:translate-x-2 transition-all text-base group"
              >
                <Users
                  size={16}
                  className="text-golf-green group-hover:scale-110 transition-transform"
                />
                Junior Programs
              </Link>
              <Link
                href="/calendar"
                className="flex items-center gap-3 text-gray-300 hover:text-white hover:translate-x-2 transition-all text-base group"
              >
                <Calendar
                  size={16}
                  className="text-golf-green group-hover:scale-110 transition-transform"
                />
                Calendar
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Share2 size={22} className="text-golf-orange" />
              <h3 className="text-xl font-bold text-golf-orange">Follow Us</h3>
            </div>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/toskigolfacademy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-green-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12zm-5.864 0h-1.658v6.182h1.658v-6.182zm-1.658-2.5c.553 0 1-.447 1-1s-.447-1-1-1-1 .447-1 1-.447 1 1zm8.965 2.5h-1.591v3.318c0 .848-.507 1.286-1.182 1.286-.685 0-1.182-.438-1.182-1.286v-3.318h-1.591v6.182h1.591v-1.637c.438.568.964.902 1.596.902 1.39 0 2.5-1.11 2.5-2.5v-6.182z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/toskigolfacademy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-green-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-5.91 2.65-5.91 5.91s2.651 5.91 5.91 5.91 5.91-2.651 5.91-5.91-2.651-5.91-5.91-5.91zm-2.91 5.91c0-1.607 1.303-2.91 2.91-2.91s2.91 1.303 2.91 2.91-1.303 2.91-2.91 2.91zm5.734-6.687h-2.085v3.569c0 1.525-.849 2.591-2.06 2.591-1.277 0-2.026-.906-2.026-2.023v-2.137h1.611v-.949h-1.611v-2.718h-2.006v2.718h-1.27v.949h1.27v2.137c0 1.974 1.028 3.506 2.773 3.506 1.659 0 2.821-1.041 3.019-2.536v-1.972h1.59v-.949h-1.59v-3.569z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-green-800/30">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Toski Golf Academy. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
