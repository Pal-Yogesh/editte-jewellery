import { getSession } from "@/lib/session";
import { getApprovedProducts, getProductsByCategory } from "@/lib/products";
import { resolveCategory } from "@/lib/categoryProducts";
import NewArrivalsScroller from "./NewArrivalsScroller";
import type { NewArrivalItem } from "@/lib/types";

const MAX_ITEMS = 12;

/**
 * Homepage New Arrivals: live Firestore products only.
 * Prefers admin-granted "new-in" placements; otherwise newest approved listings.
 */
export default async function NewArrivals() {
  const session = await getSession();
  const isLoggedIn = !!session?.uid;

  const newInRoute = resolveCategory("new-in");
  let items: NewArrivalItem[] = [];

  if (newInRoute) {
    const placed = await getProductsByCategory(newInRoute);
    items = placed.slice(0, MAX_ITEMS).map((p, i) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.productType || p.categoryPath || p.category,
      order: i,
      status: "published" as const,
    }));
  }

  if (items.length === 0) {
    const approved = await getApprovedProducts();
    items = approved.slice(0, MAX_ITEMS).map((p, i) => ({
      id: p.id,
      name: p.title,
      price: p.finalPrice || p.price,
      image: p.image,
      category: p.category || p.brandName || "Jewellery",
      order: i,
      status: "published" as const,
    }));
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-salt py-14 px-20 relative overflow-hidden">
      <h2
        className="font-numeric text-cacao uppercase text-center mb-9"
        style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
      >
        New Arrivals
      </h2>
      <NewArrivalsScroller items={items} isLoggedIn={isLoggedIn} />
    </section>
  );
}
