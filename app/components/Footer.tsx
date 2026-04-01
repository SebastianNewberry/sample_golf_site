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
  Facebook,
  Instagram,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-4 space-y-6">
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
          <div className="lg:col-span-4 space-y-4">
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
          <div className="lg:col-span-2 space-y-4">
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
          <div className="lg:col-span-2 space-y-4">
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
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/toskigolfacademy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-green-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
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
