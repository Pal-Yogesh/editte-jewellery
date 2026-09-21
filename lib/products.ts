import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { signPath } from "@/lib/storage";
import {
  categorySlug,
  placementMatches,
  type CategoryProduct,
  type CategoryRoute,
} from "@/lib/categoryProducts";

// ─── List view type (for grids) ────────────────────────────────────────────

export interface ApprovedProduct {
  id: string;
  title: string;
  price: number;
  finalPrice: number;
  discountPercent: number;
  category: string;
  brandName: string;
  image: string; // signed URL of the first media item
}

/**
 * Fetches all approved products from Firestore and returns them
 * with a signed image URL for display on the customer side.
 */
export async function getApprovedProducts(): Promise<ApprovedProduct[]> {
  const snap = await adminDb
    .collection("products")
    .where("status", "==", "approved")
    .get();

  const products = await Promise.all(
    snap.docs
      .filter((doc) => doc.data().visibleOnSite !== false)
      .sort((a, b) => {
        const aTime = (a.data().createdAt as string) ?? "";
        const bTime = (b.data().createdAt as string) ?? "";
        return bTime.localeCompare(aTime);
      })
      .map(async (doc) => {
        const data = doc.data();
        const media: { path?: string }[] = Array.isArray(data.media) ? data.media : [];
        const firstImagePath = media[0]?.path ?? "";
        const image = await signPath(firstImagePath);

        return {
          id: doc.id,
          title: (data.title as string) ?? "",
          price: (data.price as number) ?? 0,
          finalPrice: (data.finalPrice as number) ?? data.price ?? 0,
          discountPercent: (data.discountPercent as number) ?? 0,
          category: (data.category as string) ?? "",
          brandName: (data.brandName as string) ?? "",
          image,
        };
      })
  );

  return products;
}

// ─── Detail view type (for product page) ───────────────────────────────────

export interface ProductMedia {
  id: string;
  url: string;
  kind: "image" | "video";
}

export interface ProductDetail {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  finalPrice: number;
  discountPercent: number;
  category: string;
  categorySlug: string;
  department: string;
  categoryGroup: string;
  productType: string;
  brandName: string;
  metal: string;
  colors: string[];
  size: string;
  weightGrams: number;
  sku: string;
  quantity: number;
  media: ProductMedia[];
}

export interface VendorInfo {
  vendorId: string;
  brandName: string;
  pickupPincode: string;
  city: string;
  state: string;
}

/**
 * Fetches a single approved product by ID with all media signed URLs.
 * Returns null if not found or not approved.
 */
export async function getProductById(productId: string): Promise<ProductDetail | null> {
  const doc = await adminDb.collection("products").doc(productId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  if (data.status !== "approved") return null;
  // An admin can pull a listing off the site without rejecting it.
  if (data.visibleOnSite === false) return null;

  const rawMedia: { id?: string; path?: string; kind?: string }[] = Array.isArray(data.media)
    ? data.media
    : [];

  const media = await Promise.all(
    rawMedia.map(async (m, i) => ({
      id: m.id ?? `media-${i}`,
      url: await signPath(m.path ?? ""),
      kind: (m.kind as "image" | "video") ?? "image",
    }))
  );

  return {
    id: doc.id,
    vendorId: (data.vendorId as string) ?? "",
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    price: (data.price as number) ?? 0,
    finalPrice: (data.finalPrice as number) ?? data.price ?? 0,
    discountPercent: (data.discountPercent as number) ?? 0,
    category: (data.category as string) ?? "",
    categorySlug: toCategorySlug(data),
    department: (data.department as string) ?? "",
    categoryGroup: (data.categoryGroup as string) ?? "",
    productType: (data.productType as string) ?? "",
    brandName: (data.brandName as string) ?? "",
    metal: (data.metal as string) ?? "",
    colors: Array.isArray(data.colors) ? (data.colors as string[]) : [],
    size: (data.size as string) ?? "",
    weightGrams: (data.weightGrams as number) ?? 0,
    sku: (data.sku as string) ?? "",
    quantity: (data.quantity as number) ?? 0,
    media,
  };
}

/**
 * Fetches the vendor's pickup address info (pincode, city, state, brand name).
 * Used to calculate shipping rates from vendor location to customer.
 */
export async function getVendorInfo(vendorId: string): Promise<VendorInfo | null> {
  if (!vendorId) return null;

  const doc = await adminDb.collection("vendors").doc(vendorId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  const pickup = data.pickupAddress ?? {};
  const profile = data.profile ?? {};

  return {
    vendorId: doc.id,
    brandName: (profile.brandName as string) ?? "",
    pickupPincode: (pickup.pincode as string) ?? "",
    city: (pickup.city as string) ?? "",
    state: (pickup.state as string) ?? "",
  };
}

// ─── Category listing ──────────────────────────────────────────────────────

type ProductDoc = FirebaseFirestore.DocumentData;

/** Canonical storefront slug for a product doc, e.g. "women-rings". */
function toCategorySlug(data: ProductDoc): string {
  const department = (data.department as string) ?? "";
  const group = (data.categoryGroup as string) ?? "";
  const type = (data.productType as string) ?? "";
  if (!department || !group || !type) return "";
  return categorySlug(department, group, type);
}

/** The vendor stores one size string; the storefront filters on a list. */
function splitSizes(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Fetches approved products for a category route. The route carries equality
 * filters for as much of the taxonomy as the URL pins down — a department page
 * filters on `department` alone, a product-type page on all three fields.
 *
 * A curated rail (New In, Designers, Sale) instead matches the placements an
 * admin granted, so it shows the two or three pieces that were picked rather
 * than everything that asked for the rail.
 *
 * Placement and visibility are matched in memory: `array-contains` alongside an
 * equality filter needs its own composite index, and products predating these
 * fields would be excluded by a `where` on them. Ordering is in memory for the
 * same reason.
 */
export async function getProductsByCategory(
  route: CategoryRoute
): Promise<CategoryProduct[]> {
  let query: FirebaseFirestore.Query = adminDb
    .collection("products")
    .where("status", "==", "approved");

  if (route.department) query = query.where("department", "==", route.department);
  if (route.categoryGroup)
    query = query.where("categoryGroup", "==", route.categoryGroup);
  if (route.productType)
    query = query.where("productType", "==", route.productType);

  const snap = await query.get();

  return Promise.all(
    snap.docs
      .filter((doc) => {
        const data = doc.data();
        if (data.visibleOnSite === false) return false;
        if (!route.placement) return true;
        const granted: string[] = Array.isArray(data.placements)
          ? data.placements
          : [];
        return granted.some((id) => placementMatches(id, route.placement!));
      })
      .sort((a, b) => {
        const aTime = (a.data().createdAt as string) ?? "";
        const bTime = (b.data().createdAt as string) ?? "";
        return bTime.localeCompare(aTime);
      })
      .map(categoryProductFromDoc)
  );
}

/** Maps a product document to the shape the storefront grids render. */
export async function categoryProductFromDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot
): Promise<CategoryProduct> {
  const data = doc.data();
  const media: { path?: string; kind?: string }[] = Array.isArray(data.media)
    ? data.media
    : [];
  const firstImage = media.find((m) => (m.kind ?? "image") === "image");

  const price = (data.price as number) ?? 0;
  const finalPrice = (data.finalPrice as number) ?? price;
  const discountPercent = (data.discountPercent as number) ?? 0;

  return {
    id: doc.id,
    name: (data.title as string) ?? "",
    designer: (data.brandName as string) ?? "",
    price: finalPrice,
    originalPrice: discountPercent > 0 ? price : undefined,
    image: await signPath(firstImage?.path ?? ""),
    productType: (data.productType as string) ?? "",
    category: toCategorySlug(data),
    categoryPath: (data.category as string) ?? "",
    colours: Array.isArray(data.colors) ? (data.colors as string[]) : [],
    material: (data.metal as string) ?? "",
    sizes: splitSizes(data.size),
    inStock: ((data.quantity as number) ?? 0) > 0,
  };
}
