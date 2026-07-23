export type ProductStatus = "pending" | "approved" | "rejected";

export type ProductMediaKind = "image" | "video";

export type ProductMedia = {
  id: string;
  path: string;
  contentType: string;
  kind: ProductMediaKind;
};

export type ProductRecord = {
  productId: string;
  vendorId: string;
  title: string;
  description: string;
  media: ProductMedia[];
  price: number; // original / MRP
  discountPercent: number;
  finalPrice: number;
  metal: string;
  colors: string[];
  size: string;
  category: string;
  brandName: string;
  quantity: number;
  minQuantity: number;
  sku: string;
  status: ProductStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export const PRODUCT_COLLECTION = "products";
export const MAX_PRODUCT_IMAGES = 6;

/** Computes the final price from an original price and a discount percentage. */
export function computeFinalPrice(price: number, discountPercent: number): number {
  const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
  const safeDiscount =
    Number.isFinite(discountPercent) && discountPercent > 0
      ? Math.min(discountPercent, 100)
      : 0;
  const final = safePrice - (safePrice * safeDiscount) / 100;
  return Math.round(final * 100) / 100;
}

export function normaliseProduct(
  productId: string,
  data: FirebaseFirestore.DocumentData
): ProductRecord {
  return {
    productId,
    vendorId: (data.vendorId as string) ?? "",
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    media: Array.isArray(data.media) ? (data.media as ProductMedia[]) : [],
    price: (data.price as number) ?? 0,
    discountPercent: (data.discountPercent as number) ?? 0,
    finalPrice: (data.finalPrice as number) ?? 0,
    metal: (data.metal as string) ?? "",
    colors: Array.isArray(data.colors) ? (data.colors as string[]) : [],
    size: (data.size as string) ?? "",
    category: (data.category as string) ?? "",
    brandName: (data.brandName as string) ?? "",
    quantity: (data.quantity as number) ?? 0,
    minQuantity: (data.minQuantity as number) ?? 0,
    sku: (data.sku as string) ?? "",
    status: (data.status as ProductStatus) ?? "pending",
    rejectionReason: (data.rejectionReason as string | null) ?? null,
    createdAt: (data.createdAt as string) ?? "",
    updatedAt: (data.updatedAt as string) ?? "",
  };
}
