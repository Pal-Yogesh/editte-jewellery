import type { Metadata } from "next";
import { Sorts_Mill_Goudy } from "next/font/google";
import "./globals.css";

// Sorts Mill Goudy — the single font used across the entire site
const goudy = Sorts_Mill_Goudy({
  variable: "--font-goudy",
  weight: ["400"],
  style: ["normal", "italic"],
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
    <html lang="en" className={`${goudy.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
