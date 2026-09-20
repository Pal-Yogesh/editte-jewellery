import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { signPath } from "@/lib/storage";

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
  brandName: string;
  metal: string;
  colors: string[];
  size: string;
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
    brandName: (data.brandName as string) ?? "",
    metal: (data.metal as string) ?? "",
    colors: Array.isArray(data.colors) ? (data.colors as string[]) : [],
    size: (data.size as string) ?? "",
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
