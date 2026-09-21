import Link from "next/link";
import Image from "next/image";
import { getStorefrontDesigners } from "@/lib/designers";
import SiteNavbar from "@/components/SiteNavbar";
import Footer from "@/components/Footer";

export const metadata = { title: "Designers — editte" };

export default async function DesignersPage() {
  const designers = await getStorefrontDesigners();

  return (
    <>
      <SiteNavbar />
      <div className="min-h-screen bg-salt">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 text-sm text-ink/40">
            <Link href="/" className="hover:text-cacao -mt-1.25 transition-colors">
              <Image
                src="/logo/full-name-logo-removebg-preview.png"
                alt="editte"
                width={1000}
                height={1000}
                className="w-16 h-16"
              />
            </Link>
            <span>/</span>
            <span className="text-cacao text-sm">Designers</span>
          </div>

          <h1
            className="font-heading text-cacao mt-3"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            Designers
          </h1>
          <p className="text-ink/50 text-sm mt-1 max-w-md">
            The makers in our collective. Every label here is a registered
            designer listing their own work.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-20">
          {designers.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">✦</p>
              <p className="font-heading text-cacao text-xl">No designers yet</p>
              <p className="text-ink/40 text-sm mt-2">
                Labels appear here once they are approved and listing pieces.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {designers.map((d) => (
                <Link
                  key={d.vendorId}
                  href={`/designer/${d.slug}`}
                  className="group block"
                >
                  <div className="aspect-square bg-sand/20 overflow-hidden flex items-center justify-center">
                    {d.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.logo}
                        alt={d.brandName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="font-heading text-cacao/30 text-3xl">
                        {d.brandName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="font-heading text-cacao text-[0.95rem] mt-3 group-hover:text-sage transition-colors">
                    {d.brandName}
                  </p>
                  <p className="text-ink/40 text-xs mt-0.5">
                    {d.productCount} piece{d.productCount !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
