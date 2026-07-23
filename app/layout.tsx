import type { Metadata } from "next";
import { Open_Sans, Sorts_Mill_Goudy } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

// Web-available Goudy Old Style match; the CSS stack prefers the real
// "Goudy Old Style" when the visitor has it installed.
const goudy = Sorts_Mill_Goudy({
  variable: "--font-goudy",
  subsets: ["latin"],
  weight: "400",
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
    <html lang="en">
      <body className={`${openSans.variable} ${goudy.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
