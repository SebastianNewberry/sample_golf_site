import type { Metadata } from "next";
import "./globals.css";
import { Montserrat, Playfair_Display } from "next/font/google";
import Navigation from "./components/Navigation";
import { CartProvider } from "./components/cart/CartContext";
import Footer from "./components/Footer";
import logo from "@/public/logo.webp";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
  fallback: ["sans-serif", "Arial", "Helvetica"],
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
  fallback: ["serif", "Georgia", "Times New Roman"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Toski Golf Academy - Premier Golf Instruction in Troy, Michigan",
  description:
    "Toski Golf Academy offers premier golf instruction for adults and juniors in Troy, Michigan. Private lessons, junior programs, and golf camps at Sanctuary Lake Golf Course and Evolution SportsPlex.",
  icons: {
    icon: [{ url: logo.src, type: "image/webp" }],
    apple: [{ url: logo.src, type: "image/webp" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body className="antialiased flex flex-col min-h-screen font-sans">
        <CartProvider>
          <Navigation />
          <div className="flex-grow">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
