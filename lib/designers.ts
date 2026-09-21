import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { signPath } from "@/lib/storage";
import { categoryProductFromDoc } from "@/lib/products";
import { slugify, type CategoryProduct } from "@/lib/categoryProducts";

/**
 * The DESIGNERS rail is the vendor directory: every approved vendor who has at
 * least one live product becomes a designer on the storefront. Nothing here is
 * curated per-product — a vendor earns a page by being approved and listing
 * something, which is why "Designers" is not one of the admin placements.
 */
export interface StorefrontDesigner {
  vendorId: string;
  /** URL slug, e.g. "noor-by-varnan". */
  slug: string;
  brandName: string;
  /** Signed logo URL, or "" when the vendor never uploaded one. */
  logo: string;
  about: string;
  brandStory: string;
  /** Live products — the directory never lists an empty designer. */
  productCount: number;
}

/**
 * Two vendors can register the same brand name. The older one (by vendorId,
 * which is stable) keeps the clean slug; later ones get a short suffix so a
 * designer link can never resolve to someone else's shop.
 */
function assignSlugs(
  vendors: { vendorId: string; brandName: string }[]
): Map<string, string> {
  const slugs = new Map<string, string>();
  const taken = new Set<string>();

  for (const vendor of [...vendors].sort((a, b) =>
    a.vendorId.localeCompare(b.vendorId)
  )) {
    const base = slugify(vendor.brandName) || "designer";
    let slug = base;
    if (taken.has(slug)) slug = `${base}-${vendor.vendorId.slice(0, 6).toLowerCase()}`;
    taken.add(slug);
    slugs.set(vendor.vendorId, slug);
  }

  return slugs;
}

async function fetchDesigners(): Promise<StorefrontDesigner[]> {
  const [vendorSnap, productSnap] = await Promise.all([
    adminDb.collection("vendors").where("status", "==", "approved").get(),
    adminDb.collection("products").where("status", "==", "approved").get(),
  ]);

  // Live products per vendor — hidden listings don't earn a designer a page.
  const counts = new Map<string, number>();
  for (const doc of productSnap.docs) {
    const data = doc.data();
    if (data.visibleOnSite === false) continue;
    const vendorId = (data.vendorId as string) ?? "";
    if (!vendorId) continue;
    counts.set(vendorId, (counts.get(vendorId) ?? 0) + 1);
  }

  const raw = vendorSnap.docs
    .map((doc) => {
      const profile = doc.data().profile ?? {};
      return {
        vendorId: doc.id,
        brandName: (profile.brandName as string) ?? "",
        logoPath: (profile.logoPath as string) ?? "",
        about: (profile.about as string) ?? "",
        brandStory: (profile.brandStory as string) ?? "",
      };
    })
    .filter((v) => v.brandName && (counts.get(v.vendorId) ?? 0) > 0);

  const slugs = assignSlugs(raw);

  const designers = await Promise.all(
    raw.map(async (v) => ({
      vendorId: v.vendorId,
      slug: slugs.get(v.vendorId)!,
      brandName: v.brandName,
      logo: await signPath(v.logoPath),
      about: v.about,
      brandStory: v.brandStory,
      productCount: counts.get(v.vendorId) ?? 0,
    }))
  );

  return designers.sort((a, b) => a.brandName.localeCompare(b.brandName));
}

/**
 * Cached because the navbar asks for it on every page render. An hour is well
 * inside the 7-day signed-URL window used for logos.
 */
export const getStorefrontDesigners = unstable_cache(
  fetchDesigners,
  ["storefront:designers"],
  { tags: ["storefront:designers"], revalidate: 3600 }
);

export async function getDesignerBySlug(
  slug: string
): Promise<StorefrontDesigner | null> {
  const designers = await getStorefrontDesigners();
  return designers.find((d) => d.slug === slug) ?? null;
}

/** Every live product from one vendor, newest first. */
export async function getDesignerProducts(
  vendorId: string
): Promise<CategoryProduct[]> {
  const snap = await adminDb
    .collection("products")
    .where("status", "==", "approved")
    .where("vendorId", "==", vendorId)
    .get();

  return Promise.all(
    snap.docs
      .filter((doc) => doc.data().visibleOnSite !== false)
      .sort((a, b) => {
        const aTime = (a.data().createdAt as string) ?? "";
        const bTime = (b.data().createdAt as string) ?? "";
        return bTime.localeCompare(aTime);
      })
      .map(categoryProductFromDoc)
  );
}
