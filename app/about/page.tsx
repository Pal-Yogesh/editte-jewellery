import ZaraNavbar from "@/components/ZaraNavbar";
import NavbarActions from "@/components/NavbarActions";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About — editte",
  description:
    "Editte brings together jewellery, accessories and lifestyle pieces chosen with intention — a space to explore different sides of your style.",
};

/** Label-left / copy-right row, as used for Vision and Mission. */
function StatementRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-3 md:gap-10">
      <h3 className="font-heading text-cacao uppercase tracking-[0.14em] text-lg md:text-xl md:pt-0.5">
        {label}
      </h3>
      <p className="text-ink/70 leading-[1.85] text-[0.95rem] md:text-base max-w-2xl">
        {children}
      </p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <ZaraNavbar actions={<NavbarActions />} />
      <div className="min-h-screen bg-salt">
        <div className="text-cacao pt-28 pb-10 px-6 text-center">
          <h1 className="font-heading text-3xl md:text-5xl">About</h1>
        </div>

        {/* ── Why do we exist ── */}
        <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
          <h2
            className="font-heading text-cacao uppercase tracking-[0.05em]"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
          >
            Why Do We Exist?
          </h2>

          <div className="mt-10 flex flex-col gap-6 text-ink/70 leading-[1.85] text-[0.95rem] md:text-base">
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

        {/* ── Vision & Mission ── */}
        <section className="max-w-5xl mx-auto px-6 pb-28">
          <div className="border-t border-cacao/10 pt-14 flex flex-col gap-12 md:gap-16">
            <StatementRow label="Our Vision">
              To build a contemporary platform for design-led discovery, bringing together diverse
              brands, categories, and expressions of style, while creating a more thoughtful and
              accessible way to pick pieces.
            </StatementRow>

            <StatementRow label="Our Mission">
              To make well-designed jewellery, accessories, and lifestyle pieces easier to
              discover, so people can explore, choose, and express their style with clarity and
              confidence.
            </StatementRow>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
