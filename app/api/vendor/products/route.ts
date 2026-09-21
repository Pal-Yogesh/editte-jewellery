import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/firebase-admin";
import { getSessionVendor } from "@/lib/vendor/session";
import { uploadVendorFile } from "@/lib/vendor/storage";
import { serializeProduct } from "@/lib/product/serialize";
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_COLLECTION,
  computeFinalPrice,
  normaliseProduct,
  type ProductMedia,
} from "@/lib/product/types";
import {
  departmentLabels,
  formatCategoryPath,
  getDepartment,
  getGroup,
  isValidCategory,
} from "@/lib/product/categories";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MIN_IMAGE_BYTES = 20 * 1024;        //  20 KB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;  //   5 MB
const MIN_VIDEO_BYTES = 500 * 1024;       // 500 KB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; //  50 MB

function parseList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const snapshot = await db
    .collection(PRODUCT_COLLECTION)
    .where("vendorId", "==", vendor.vendorId)
    .get();

  const products = await Promise.all(
    snapshot.docs
      .map((doc) => normaliseProduct(doc.id, doc.data()))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((product) => serializeProduct(product))
  );

  return NextResponse.json({ products }, { status: 200 });
}

export async function POST(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  // Only approved vendors may list products.
  if (vendor.status !== "approved") {
    return NextResponse.json(
      { message: "Your account must be approved before you can add products." },
      { status: 403 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data." }, { status: 400 });
  }

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
    (form.get("brandName") as string | null)?.trim() || vendor.profile.brandName;
  const quantity = Number(form.get("quantity")) || 0;
  const minQuantity = Number(form.get("minQuantity")) || 0;
  const sku = (form.get("sku") as string | null)?.trim() ?? "";

  if (!title) {
    return NextResponse.json({ message: "Product title is required." }, { status: 400 });
  }
  if (!sku) {
    return NextResponse.json({ message: "SKU is required." }, { status: 400 });
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ message: "A valid product price is required." }, { status: 400 });
  }
  if (discountPercent < 0 || discountPercent > 100) {
    return NextResponse.json({ message: "Discount must be between 0 and 100." }, { status: 400 });
  }
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
    return NextResponse.json(
      { message: "Product weight in grams is required and must be greater than 0." },
      { status: 400 }
    );
  }

  // Category must be a complete, valid path through the taxonomy — a partial
  // or mismatched selection (e.g. Men / Bags) is rejected outright.
  if (!getDepartment(department)) {
    return NextResponse.json(
      { message: `Select a category. Options: ${departmentLabels()}.` },
      { status: 400 }
    );
  }
  if (!getGroup(department, categoryGroup)) {
    return NextResponse.json(
      { message: "Select a valid sub-category for the chosen category." },
      { status: 400 }
    );
  }
  if (!isValidCategory(department, categoryGroup, productType)) {
    return NextResponse.json(
      { message: "Select a valid product type for the chosen sub-category." },
      { status: 400 }
    );
  }

  const category = formatCategoryPath(department, categoryGroup, productType);

  const images = form.getAll("images").filter((f): f is File => f instanceof File);
  const video = form.get("video");

  // At least one image is mandatory — a product cannot be submitted for
  // approval without a main image.
  if (images.length === 0) {
    return NextResponse.json(
      { message: "At least one product image is required before submitting for approval." },
      { status: 400 }
    );
  }
  if (images.length > MAX_PRODUCT_IMAGES) {
    return NextResponse.json(
      { message: `A product can have at most ${MAX_PRODUCT_IMAGES} images.` },
      { status: 400 }
    );
  }

  const media: ProductMedia[] = [];

  for (const image of images) {
    if (!IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json(
        { message: "Product images must be PNG, JPEG, or WebP." },
        { status: 400 }
      );
    }
    if (image.size < MIN_IMAGE_BYTES) {
      return NextResponse.json(
        { message: `Image "${image.name}" is too small (min 20 KB). Please upload a higher-quality image.` },
        { status: 400 }
      );
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { message: "Each image must be 5 MB or smaller." },
        { status: 400 }
      );
    }
    const uploaded = await uploadVendorFile(vendor.vendorId, "products", image);
    media.push({
      id: randomUUID(),
      path: uploaded.path,
      contentType: uploaded.contentType,
      kind: "image",
    });
  }

  if (video instanceof File && video.size > 0) {
    if (!VIDEO_TYPES.includes(video.type)) {
      return NextResponse.json(
        { message: "Product video must be MP4, WebM, or MOV." },
        { status: 400 }
      );
    }
    if (video.size < MIN_VIDEO_BYTES) {
      return NextResponse.json(
        { message: `Video "${video.name}" is too small (min 500 KB). Please upload a proper product video.` },
        { status: 400 }
      );
    }
    if (video.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { message: "Video must be 50 MB or smaller." },
        { status: 400 }
      );
    }
    const uploaded = await uploadVendorFile(vendor.vendorId, "products", video);
    media.push({
      id: randomUUID(),
      path: uploaded.path,
      contentType: uploaded.contentType,
      kind: "video",
    });
  }

  const now = new Date().toISOString();
  const ref = db.collection(PRODUCT_COLLECTION).doc();
  await ref.set({
    vendorId: vendor.vendorId,
    title,
    description,
    media,
    price,
    discountPercent,
    finalPrice: computeFinalPrice(price, discountPercent),
    metal,
    colors,
    size,
    weightGrams,
    department,
    categoryGroup,
    productType,
    category,
    brandName,
    quantity,
    minQuantity,
    sku,
    status: "pending",
    rejectionReason: null,
    createdAt: now,
    updatedAt: now,
  });

  const created = normaliseProduct(ref.id, (await ref.get()).data()!);
  return NextResponse.json(
    { message: "Product submitted for approval.", product: await serializeProduct(created) },
    { status: 201 }
  );
}
