// ============================================================
// editte — Font setup for your root layout (app/layout.tsx)
// ------------------------------------------------------------
// The whole theme uses a single typeface: Sorts Mill Goudy.
// This exposes it as the CSS variable `--font-goudy`, which
// theme.css consumes. Merge the relevant bits into your own
// layout file.
// ============================================================

import type { Metadata } from "next";
import { Sorts_Mill_Goudy } from "next/font/google";
import "./globals.css"; // <- make sure this file contains the theme.css contents

// Sorts Mill Goudy — the single font used across the entire site
const goudy = Sorts_Mill_Goudy({
  variable: "--font-goudy",
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Your Site",
  description: "Your description.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${goudy.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
