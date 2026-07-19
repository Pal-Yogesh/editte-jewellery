import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "editte — Account" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-salt flex">
      {/* Left panel — decorative brand image (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-cacao overflow-hidden">
        <Image
          src="/images-2/Daily.jpg"
          alt="editte jewellery"
          fill
          sizes="50vw"
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cacao/60 via-cacao/20 to-cacao/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="text-white text-2xl tracking-[0.3em] uppercase font-heading">
            editte
          </Link>
          <div>
            <p className="text-white/80 text-lg leading-relaxed max-w-xs">
              India&apos;s first jewellery makers collective.
            </p>
            <p className="text-white/50 text-sm mt-2 tracking-wider uppercase">
              40+ independent designers
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden text-cacao text-xl tracking-[0.3em] uppercase font-heading mb-10 block"
        >
          editte
        </Link>
        {children}
      </div>
    </div>
  );
}
