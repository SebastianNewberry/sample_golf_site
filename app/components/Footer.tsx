import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Contact Button */}
          <Button className="tracking-wide uppercase">CONTACT US</Button>

          {/* Contact Email */}
          <a
            href="mailto:toskigolfacademy@gmail.com"
            className="text-gray-300 hover:text-white transition-colors text-base"
          >
            toskigolfacademy@gmail.com
          </a>

          {/* Copyright */}
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Toski Golf Academy. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
