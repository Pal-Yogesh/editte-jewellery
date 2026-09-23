import Link from "next/link";
import { getStorefrontDesigners } from "@/lib/designers";
import DesignersGrid from "./DesignersGrid";

/**
 * Homepage designers rail — approved vendors with live products from Firestore.
 */
export default async function Designers() {
  const designers = await getStorefrontDesigners();
  if (designers.length === 0) return null;

  const shown = designers.slice(0, 10);

  return (
    <section className="bg-salt pt-10 pb-20">
      <h2
        className="font-heading text-cacao text-center uppercase mb-9 px-4"
        style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 700 }}
      >
        Our Designers
      </h2>

      <DesignersGrid
        designers={shown.map((d) => ({
          slug: d.slug,
          brandName: d.brandName,
          logo: d.logo,
        }))}
      />

      {designers.length > shown.length && (
        <div className="mt-10 text-center">
          <Link
            href="/designer"
            className="inline-block text-xs tracking-[0.2em] uppercase text-cacao hover:text-sage transition-colors underline underline-offset-4"
          >
            View all designers
          </Link>
        </div>
      )}
    </section>
  );
}
