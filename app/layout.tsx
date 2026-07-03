import type { Metadata } from "next";
import { Open_Sans, Sorts_Mill_Goudy, Playfair_Display, Pinyon_Script, GFS_Didot } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

// Sorts Mill Goudy — Goudy Old Style revival, used for the "editte" wordmark
const goudy = Sorts_Mill_Goudy({
  variable: "--font-goudy",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

// Playfair Display — kept as fallback serif
const playfair = Playfair_Display({
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

// GFS Didot — authentic Didot revival, extreme thin/thick contrast, tall editorial style
const bodoni = GFS_Didot({
  variable: "--font-heading-serif",
  weight: ["400"],
  subsets: ["greek", "latin"],
  display: "swap",
});

// Pinyon Script — elegant Copperplate calligraphic script for decorative accent words
const pinyonScript = Pinyon_Script({
  variable: "--font-script",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "editte — Fine Jewellery",
  description:
    "editte — India's first jewellery makers collective. Handcrafted rings, earrings, neckpieces and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${goudy.variable} ${playfair.variable} ${bodoni.variable} ${pinyonScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
