import { unstable_cache } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/session";
import NewArrivalsScroller from "./NewArrivalsScroller";
import type { NewArrivalsContent, NewArrivalItem } from "@/lib/types";

const FALLBACK_ARRIVALS: NewArrivalItem[] = [
  { id: "a1", name: "Ring", price: 3000, image: "/images/products/NECK%20PIECES.png", category: "Neckpieces", order: 0, status: "published" },
  { id: "a2", name: "Ring", price: 3000, image: "/images/products/RING.png", category: "Rings", order: 1, status: "published" },
  { id: "a3", name: "Ring", price: 3000, image: "/images/products/BANGLES.png", category: "Bangles", order: 2, status: "published" },
  { id: "a4", name: "Ring", price: 3000, image: "/images/products/EARRINGS.png", category: "Earrings", order: 3, status: "published" },
  { id: "a5", name: "Ring", price: 3000, image: "/images/products/NECK%20PIECES.png", category: "Neckpieces", order: 4, status: "published" },
  { id: "a6", name: "Ring", price: 3000, image: "/images/products/RING.png", category: "Rings", order: 5, status: "published" },
  { id: "a7", name: "Ring", price: 3000, image: "/images/products/EARRINGS.png", category: "Earrings", order: 6, status: "published" },
  { id: "a8", name: "Ring", price: 3000, image: "/images/products/BANGLES.png", category: "Bangles", order: 7, status: "published" },
];

const getNewArrivalsContent = unstable_cache(
  async () => {
    try {
      const snap = await adminDb.collection("siteContent").doc("newArrivals").get();
      if (!snap.exists) return null;
      return snap.data() as NewArrivalsContent;
    } catch {
      return null;
    }
  },
  ["content:newArrivals"],
  { tags: ["content:newArrivals"], revalidate: 3600 }
);

export default async function NewArrivals() {
  const [session, content] = await Promise.all([
    getSession(),
    getNewArrivalsContent(),
  ]);

  const isLoggedIn = !!session?.uid;

  const published = (content?.items ?? [])
    .filter((i) => i.status === "published")
    .sort((a, b) => a.order - b.order);

  const items = published.length > 0 ? published : FALLBACK_ARRIVALS;

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
