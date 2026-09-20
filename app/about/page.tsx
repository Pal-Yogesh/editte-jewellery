import Link from "next/link";
import ZaraNavbar from "@/components/ZaraNavbar";
import NavbarActions from "@/components/NavbarActions";
import Footer from "@/components/Footer";
import { ALL_PRODUCTS_SLUG } from "@/lib/categoryProducts";

export const metadata = {
  title: "About — editte",
  description:
    "Editte brings together jewellery, accessories and lifestyle pieces chosen with intention — a space to explore different sides of your style.",
};

/** Numbered editorial statement card, used for Vision and Mission. */
function StatementCard({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 border-t border-cacao/15 pt-7">
      <span className="block font-numeric text-[11px] tracking-[0.3em] text-sage mb-4">{index}</span>
      <h3
        className="font-heading text-cacao text-xl md:text-2xl mb-4"
        style={{ fontStyle: "italic" }}
      >
        {label}
      </h3>
      <p className="text-ink/65 leading-[1.85] text-[0.95rem] md:text-base max-w-md">{children}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <ZaraNavbar actions={<NavbarActions />} />
      <div className="min-h-screen bg-salt">
        {/* ── Hero ── */}
        <section className="relative w-full h-[62svh] min-h-[420px] overflow-hidden bg-cacao">
          <img
            src="/original-images/01.png"
            alt="Editte jewellery"
            className="absolute inset-0 w-full h-full object-cover object-[78%_center]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(12,14,14,0.45) 0%, rgba(12,14,14,0.08) 35%, rgba(12,14,14,0.55) 100%)",
            }}
          />
          <div className="relative h-full flex flex-col items-center justify-end text-center pb-16 px-6">
            <span className="text-[11px] tracking-[0.35em] uppercase text-white/70 mb-3">Editte</span>
            <h1 className="font-heading text-white text-4xl md:text-6xl" style={{ fontStyle: "italic" }}>
              About
            </h1>
          </div>
        </section>

        {/* ── Vision & Mission ── */}
        <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <StatementCard index="01" label="Our Vision">
              To build a contemporary platform for design-led discovery, bringing together diverse
              brands, categories, and expressions of style, while creating a more thoughtful and
              accessible way to pick pieces.
            </StatementCard>

            <StatementCard index="02" label="Our Mission">
              To make well-designed jewellery, accessories, and lifestyle pieces easier to
              discover, so people can explore, choose, and express their style with clarity and
              confidence.
            </StatementCard>
          </div>
        </section>

        {/* ── Editorial break image ── */}
        <section className="relative w-full h-[40vh] md:h-[52vh] overflow-hidden">
          <img
            src="/original-images/07.png"
            alt="Editte occasion jewellery"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-cacao/10" />
        </section>

        {/* ── Story copy ── */}
        <section className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col gap-6 text-ink/70 leading-[1.9] text-[0.95rem] md:text-base text-center">
            <p>
              We&rsquo;ve always believed that style should feel like your own. Some days, that
              looks simple. Some days it&rsquo;s expressive, and sometimes it&rsquo;s something you
              wear every day.
            </p>
            <p>
              But finding those pieces isn&rsquo;t always easy. There&rsquo;s a lot out there, from
              trends, collections, and constant newness. And somewhere in between, it becomes
              harder to find what actually fits you.
            </p>
            <p>
              Editte was built to make that process clearer. We bring together jewellery,
              accessories, and lifestyle pieces that are not defined by one way of dressing, but by
              how they make you feel. From everyday staples to occasion-led pieces, from subtle to
              statement, everything here is chosen with intention.
            </p>
            <p>
              Editte is all about having a space where you can explore different sides of your
              style and find what feels right, when it does.
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center pb-28 px-6">
          <Link
            href={`/category/${ALL_PRODUCTS_SLUG}`}
            className="inline-flex items-center gap-2 border border-cacao px-8 py-3.5 text-[11px] tracking-[0.22em] uppercase text-cacao hover:bg-cacao hover:text-white transition-colors duration-300"
          >
            Shop Now
            <span aria-hidden>→</span>
          </Link>
        </section>
      </div>
      <Footer />
    </>
  );
}
