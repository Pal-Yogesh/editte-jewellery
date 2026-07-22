import { verifyAdmin } from "@/lib/dal";
import { getSponsoredContent } from "@/app/actions/adminContent";
import SponsoredSlidesList from "./SponsoredSlidesList";
import SponsoredAddForm from "./SponsoredAddForm";
import Link from "next/link";

export default async function SponsoredContentPage() {
  await verifyAdmin();
  const content = await getSponsoredContent();
  const slides = content?.slides ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/content" className="text-ink/30 hover:text-cacao text-xs tracking-wide transition-colors">
          ← Content
        </Link>
        <span className="text-ink/20">/</span>
        <h1 className="font-heading text-cacao text-2xl">Sponsored / Events</h1>
      </div>

      <p className="text-xs text-ink/40 bg-sand/40 rounded-lg px-4 py-3">
        New slides are saved as <strong className="text-cacao">Draft</strong>. Click <strong className="text-cacao">Publish</strong> on a slide to show it on the website.
      </p>

      <section className="bg-white rounded-xl border border-ink/5 p-6">
        <h2 className="font-heading text-cacao text-base mb-5">Event Slides ({slides.length})</h2>
        <SponsoredSlidesList slides={slides} />
      </section>

      <section className="bg-white rounded-xl border border-ink/5 p-6">
        <h2 className="font-heading text-cacao text-base mb-5">Add Slide</h2>
        <SponsoredAddForm />
      </section>
    </div>
  );
}
