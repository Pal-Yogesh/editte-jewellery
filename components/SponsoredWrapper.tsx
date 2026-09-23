import { unstable_cache } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import SponsoredProduct from "./Sponsored";
import type { SponsoredContent } from "@/lib/types";

const getSponsoredContent = unstable_cache(
  async () => {
    try {
      const snap = await adminDb.collection("siteContent").doc("sponsored").get();
      if (!snap.exists) return null;
      return snap.data() as SponsoredContent;
    } catch {
      return null;
    }
  },
  ["content:sponsored"],
  { tags: ["content:sponsored"], revalidate: 3600 }
);

export default async function SponsoredWrapper() {
  const content = await getSponsoredContent();
  const published = (content?.slides ?? [])
    .filter((s) => s.status === "published")
    .sort((a, b) => a.order - b.order);

  // No CMS slides → hide section (no hardcoded catalogue slides)
  if (published.length === 0) return null;

  return <SponsoredProduct slides={published} />;
}
