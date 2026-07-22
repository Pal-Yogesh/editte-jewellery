import { verifyAdmin } from "@/lib/dal";
import { getNewArrivalsContent } from "@/app/actions/adminContent";
import NewArrivalsList from "./NewArrivalsList";
import NewArrivalsAddForm from "./NewArrivalsAddForm";
import Link from "next/link";

export default async function NewArrivalsContentPage() {
  await verifyAdmin();
  const content = await getNewArrivalsContent();
  const items = content?.items ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/content" className="text-ink/30 hover:text-cacao text-xs tracking-wide transition-colors">
          ← Content
        </Link>
        <span className="text-ink/20">/</span>
        <h1 className="font-heading text-cacao text-2xl">New Arrivals</h1>
      </div>

      <p className="text-xs text-ink/40 bg-sand/40 rounded-lg px-4 py-3">
        New products are saved as <strong className="text-cacao">Draft</strong>. Click <strong className="text-cacao">Publish</strong> on a product to show it on the website.
      </p>

      <section className="bg-white rounded-xl border border-ink/5 p-6">
        <h2 className="font-heading text-cacao text-base mb-5">Products ({items.length})</h2>
        <NewArrivalsList items={items} />
      </section>

      <section className="bg-white rounded-xl border border-ink/5 p-6">
        <h2 className="font-heading text-cacao text-base mb-5">Add Product</h2>
        <NewArrivalsAddForm />
      </section>
    </div>
  );
}
