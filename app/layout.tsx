import type { Metadata } from "next";
import { Open_Sans, Sorts_Mill_Goudy, Playfair_Display, Tangerine } from "next/font/google";
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

// Playfair Display — bold high-contrast display serif for section headings
const playfair = Playfair_Display({
  variable: "--font-heading-serif",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

// Tangerine — elegant calligraphic script for decorative headings
const tangerine = Tangerine({
  variable: "--font-script",
  weight: ["400", "700"],
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
      className={`${openSans.variable} ${goudy.variable} ${playfair.variable} ${tangerine.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
