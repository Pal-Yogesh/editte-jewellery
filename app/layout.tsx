import type { Metadata } from "next";
import { Sorts_Mill_Goudy } from "next/font/google";
import "./globals.css";

// Sorts Mill Goudy — the single typeface used across the entire editte UI,
// matching the storefront. Body, headings, buttons and figures all share it.
const goudy = Sorts_Mill_Goudy({
  variable: "--font-goudy",
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "editte — Fine Jewellery",
  description: "editte multi-vendor fine jewellery marketplace.",
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
