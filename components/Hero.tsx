import { unstable_cache } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import HeroClient from "./HeroClient";
import type { HeroContent } from "@/lib/types";

const FALLBACK_BANNERS = [
  "/images/main-banner/1.jpg",
  "/images/main-banner/2.jpg",
  "/images/main-banner/main-banner.jpeg",
  "/images/main-banner/4.png",
];

const getHeroContent = unstable_cache(
  async () => {
    try {
      const snap = await adminDb.collection("siteContent").doc("hero").get();
      if (!snap.exists) return null;
      return snap.data() as HeroContent;
    } catch {
      return null;
    }
  },
  ["content:hero"],
  { tags: ["content:hero"], revalidate: 3600 }
);

export default async function Hero() {
  const content = await getHeroContent();

  const publishedSlides = (content?.slides ?? [])
    .filter((s) => s.status === "published")
    .sort((a, b) => a.order - b.order);

  const banners =
    publishedSlides.length > 0 ? publishedSlides.map((s) => s.url) : FALLBACK_BANNERS;

  const intervalMs = content?.intervalMs ?? 4500;

  return <HeroClient banners={banners} intervalMs={intervalMs} />;
}
