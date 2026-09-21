import { randomUUID } from "crypto";
import type { ProductMedia, ProductRecord } from "@/lib/product/types";
import { computeFinalPrice, MAX_PRODUCT_IMAGES } from "@/lib/product/types";
import { uploadVendorFile } from "@/lib/vendor/storage";
import {
  departmentLabels,
  formatCategoryPath,
  getDepartment,
  getGroup,
  isValidCategory,
  normalisePlacements,
} from "@/lib/product/categories";

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const MIN_IMAGE_BYTES = 20 * 1024;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MIN_VIDEO_BYTES = 500 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export function parseList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type ParsedProductFields = {
  title: string;
  description: string;
  price: number;
  discountPercent: number;
  metal: string;
  colors: string[];
  size: string;
  weightGrams: number;
  department: string;
  categoryGroup: string;
  productType: string;
  brandName: string;
  quantity: number;
  minQuantity: number;
  sku: string;
  category: string;
  /** Curated rails the vendor is asking to appear on — admin grants them. */
  requestedPlacements: string[];
};

export function parseProductFields(
  form: FormData,
  defaultBrandName: string
): ParsedProductFields | { error: string; status: number } {
  const title = (form.get("title") as string | null)?.trim() ?? "";
  const description = (form.get("description") as string | null)?.trim() ?? "";
  const price = Number(form.get("price"));
  const discountPercent = Number(form.get("discountPercent")) || 0;
  const metal = (form.get("metal") as string | null)?.trim() ?? "";
  const colors = parseList(form.get("colors"));
  const size = (form.get("size") as string | null)?.trim() ?? "";
  const weightGrams = Number(form.get("weightGrams"));
  const department = (form.get("department") as string | null)?.trim() ?? "";
  const categoryGroup = (form.get("categoryGroup") as string | null)?.trim() ?? "";
  const productType = (form.get("productType") as string | null)?.trim() ?? "";
  const brandName =
    (form.get("brandName") as string | null)?.trim() || defaultBrandName;
  const quantity = Number(form.get("quantity")) || 0;
  const minQuantity = Number(form.get("minQuantity")) || 0;
  const sku = (form.get("sku") as string | null)?.trim() ?? "";
  // Unknown ids are dropped rather than rejected: a placement the vendor can
  // ask for is optional by nature, and the admin decides either way.
  const requestedPlacements = normalisePlacements(parseList(form.get("placements")));

  if (!title) {
    return { error: "Product title is required.", status: 400 };
  }
  if (!sku) {
    return { error: "SKU is required.", status: 400 };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "A valid product price is required.", status: 400 };
  }
  if (discountPercent < 0 || discountPercent > 100) {
    return { error: "Discount must be between 0 and 100.", status: 400 };
  }
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
    return {
      error: "Product weight in grams is required and must be greater than 0.",
      status: 400,
    };
  }
  if (!getDepartment(department)) {
    return {
      error: `Select a category. Options: ${departmentLabels()}.`,
      status: 400,
    };
  }
  if (!getGroup(department, categoryGroup)) {
    return {
      error: "Select a valid sub-category for the chosen category.",
      status: 400,
    };
  }
  if (!isValidCategory(department, categoryGroup, productType)) {
    return {
      error: "Select a valid product type for the chosen sub-category.",
      status: 400,
    };
  }

  const category = formatCategoryPath(department, categoryGroup, productType);

  return {
    title,
    description,
    price,
    discountPercent,
    metal,
    colors,
    size,
    weightGrams,
    department,
    categoryGroup,
    productType,
    brandName,
    quantity,
    minQuantity,
    sku,
    category,
    requestedPlacements,
  };
}

export function parseRetainedMediaIds(form: FormData): string[] {
  const raw = form.get("retainedMediaIds");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export async function buildMediaFromForm(
  form: FormData,
  vendorId: string,
  existing: ProductMedia[],
  retainedMediaIds: string[]
): Promise<
  | { media: ProductMedia[]; removed: ProductMedia[] }
  | { error: string; status: number }
> {
  const retainedSet = new Set(retainedMediaIds);
  let kept = existing.filter((m) => retainedSet.has(m.id));

  const removeVideo = form.get("removeVideo") === "1";
  const newImages = form.getAll("images").filter((f): f is File => f instanceof File);
  const video = form.get("video");

  let keptVideo = kept.find((m) => m.kind === "video");

  if (removeVideo && keptVideo) {
    kept = kept.filter((m) => m.id !== keptVideo!.id);
    keptVideo = undefined;
  }

  const keptImages = kept.filter((m) => m.kind === "image");

  if (keptImages.length + newImages.length === 0) {
    return {
      error: "Keep or upload at least one product image.",
      status: 400,
    };
  }
  if (keptImages.length + newImages.length > MAX_PRODUCT_IMAGES) {
    return {
      error: `A product can have at most ${MAX_PRODUCT_IMAGES} images.`,
      status: 400,
    };
  }

  const uploaded: ProductMedia[] = [];

  for (const image of newImages) {
    if (!IMAGE_TYPES.includes(image.type)) {
      return {
        error: "Product images must be PNG, JPEG, or WebP.",
        status: 400,
      };
    }
    if (image.size < MIN_IMAGE_BYTES) {
      return {
        error: `Image "${image.name}" is too small (min 20 KB). Please upload a higher-quality image.`,
        status: 400,
      };
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { error: "Each image must be 5 MB or smaller.", status: 400 };
    }
    const up = await uploadVendorFile(vendorId, "products", image);
    uploaded.push({
      id: randomUUID(),
      path: up.path,
      contentType: up.contentType,
      kind: "image",
    });
  }

  if (video instanceof File && video.size > 0) {
    if (!VIDEO_TYPES.includes(video.type)) {
      return {
        error: "Product video must be MP4, WebM, or MOV.",
        status: 400,
      };
    }
    if (video.size < MIN_VIDEO_BYTES) {
      return {
        error: `Video "${video.name}" is too small (min 500 KB). Please upload a proper product video.`,
        status: 400,
      };
    }
    if (video.size > MAX_VIDEO_BYTES) {
      return { error: "Video must be 50 MB or smaller.", status: 400 };
    }
    const up = await uploadVendorFile(vendorId, "products", video);
    uploaded.push({
      id: randomUUID(),
      path: up.path,
      contentType: up.contentType,
      kind: "video",
    });
    keptVideo = undefined;
  }

  const media: ProductMedia[] = [
    ...kept.filter((m) => m.kind === "image"),
    ...uploaded.filter((m) => m.kind === "image"),
  ];
  const newVideo = uploaded.find((m) => m.kind === "video");
  if (newVideo) media.push(newVideo);
  else if (keptVideo && !removeVideo) media.push(keptVideo);

  const finalIds = new Set(media.map((m) => m.id));
  const toDelete = existing.filter((m) => !finalIds.has(m.id));

  return { media, removed: toDelete };
}

export function productUpdatePayload(
  fields: ParsedProductFields,
  media: ProductMedia[],
  previous: ProductRecord
) {
  const now = new Date().toISOString();
  const needsReview = previous.status === "approved" || previous.status === "rejected";

  return {
    title: fields.title,
    description: fields.description,
    media,
    price: fields.price,
    discountPercent: fields.discountPercent,
    finalPrice: computeFinalPrice(fields.price, fields.discountPercent),
    metal: fields.metal,
    colors: fields.colors,
    size: fields.size,
    weightGrams: fields.weightGrams,
    department: fields.department,
    categoryGroup: fields.categoryGroup,
    productType: fields.productType,
    category: fields.category,
    brandName: fields.brandName,
    quantity: fields.quantity,
    minQuantity: fields.minQuantity,
    sku: fields.sku,
    requestedPlacements: fields.requestedPlacements,
    // Keep the grants the admin already made, but only for rails the vendor is
    // still asking for. Dropping a request drops its placement; adding one goes
    // back into the queue ungranted.
    placements: previous.placements.filter((id) =>
      fields.requestedPlacements.includes(id)
    ),
    status: needsReview ? "pending" : previous.status,
    rejectionReason: needsReview ? null : previous.rejectionReason,
    updatedAt: now,
  };
}
