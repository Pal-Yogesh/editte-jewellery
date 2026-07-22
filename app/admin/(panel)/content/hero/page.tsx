import { verifyAdmin } from "@/lib/dal";
import { getHeroContent } from "@/app/actions/adminContent";
import HeroSlidesList from "./HeroSlidesList";
import HeroAddSlide from "./HeroAddSlide";
import Link from "next/link";

export default async function HeroContentPage() {
  await verifyAdmin();
  const content = await getHeroContent();
  const slides = content?.slides ?? [];
  const intervalMs = content?.intervalMs ?? 4500;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/content" className="text-ink/30 hover:text-cacao text-xs tracking-wide transition-colors">
          ← Content
        </Link>
        <span className="text-ink/20">/</span>
        <h1 className="font-heading text-cacao text-2xl">Hero Banner</h1>
      </div>

      <p className="text-xs text-ink/40 bg-sand/40 rounded-lg px-4 py-3">
        Each slide has its own <strong className="text-cacao">Publish / Draft</strong> toggle. Only published slides show on the site.
      </p>

      {/* Current slides */}
      <section className="bg-white rounded-xl border border-ink/5 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-cacao text-base">Slides ({slides.length})</h2>
          <p className="text-xs text-ink/40">Interval: {intervalMs}ms</p>
        </div>
        <HeroSlidesList slides={slides} />
      </section>

      {/* Add slide */}
      <section className="bg-white rounded-xl border border-ink/5 p-6">
        <h2 className="font-heading text-cacao text-base mb-5">Add Slide</h2>
        <HeroAddSlide />
      </section>
    </div>
  );
}
