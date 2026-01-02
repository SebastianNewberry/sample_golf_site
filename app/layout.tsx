import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Navigation from "./components/Navigation";
import { CartProvider } from "./components/cart/CartContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  fallback: ["sans-serif", "Arial", "Helvetica"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Toski Golf Academy - Premier Golf Instruction in Troy, Michigan",
  description:
    "Toski Golf Academy offers premier golf instruction for adults and juniors in Troy, Michigan. Private lessons, junior programs, and golf camps at Sanctuary Lake Golf Course and Evolution SportsPlex.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased">
        <CartProvider>
          <Navigation />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
