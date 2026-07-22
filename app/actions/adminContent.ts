"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/dal";
import { z } from "zod";
import { nanoid } from "@/lib/nanoid";
import type { ActionState } from "./auth";
import type {
  HeroContent, HeroSlide,
  NewArrivalsContent, NewArrivalItem,
  SponsoredContent, SponsoredSlide,
  ItemStatus,
} from "@/lib/types";

function flip(status: ItemStatus): ItemStatus {
  return status === "published" ? "draft" : "published";
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

export async function getHeroContent(): Promise<HeroContent | null> {
  const snap = await adminDb.collection("siteContent").doc("hero").get();
  if (!snap.exists) return null;
  return snap.data() as HeroContent;
}

export async function addHeroSlideAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const url = formData.get("url") as string;
  const alt = (formData.get("alt") as string) || "Hero slide";
  if (!url) return { message: "Image URL is required." };

  const docRef = adminDb.collection("siteContent").doc("hero");
  const snap = await docRef.get();
  const existing = snap.data() as HeroContent | undefined;
  const slides: HeroSlide[] = existing?.slides ?? [];

  // New slides start as DRAFT — hidden from the site until published
  slides.push({ id: nanoid(), url, alt, order: slides.length, status: "draft" });

  await docRef.set({
    slides,
    intervalMs: existing?.intervalMs ?? 4500,
    status: "published",
    updatedAt: Date.now(),
    updatedBy: session.uid,
  }, { merge: true });

  revalidateTag("content:hero", "max");
  revalidatePath("/admin/content/hero");
  return { success: true, message: "Slide added as draft." };
}

export async function toggleHeroSlideStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const slideId = formData.get("slideId") as string;

  const docRef = adminDb.collection("siteContent").doc("hero");
  const snap = await docRef.get();
  const existing = snap.data() as HeroContent | undefined;
  if (!existing) return { message: "No content found." };

  const slides = existing.slides.map((s) =>
    s.id === slideId ? { ...s, status: flip(s.status ?? "draft") } : s
  );
  await docRef.set({ ...existing, slides, updatedAt: Date.now(), updatedBy: session.uid });

  revalidateTag("content:hero", "max");
  revalidatePath("/admin/content/hero");
  revalidatePath("/");
  return { success: true };
}

export async function deleteHeroSlideAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const slideId = formData.get("slideId") as string;

  const docRef = adminDb.collection("siteContent").doc("hero");
  const snap = await docRef.get();
  const existing = snap.data() as HeroContent | undefined;
  if (!existing) return { message: "No hero content found." };

  const slides = existing.slides.filter((s) => s.id !== slideId);
  await docRef.set({ ...existing, slides, updatedAt: Date.now(), updatedBy: session.uid });

  revalidateTag("content:hero", "max");
  revalidatePath("/admin/content/hero");
  revalidatePath("/");
  return { success: true };
}

// ─── NEW ARRIVALS ─────────────────────────────────────────────────────────────

export async function getNewArrivalsContent(): Promise<NewArrivalsContent | null> {
  const snap = await adminDb.collection("siteContent").doc("newArrivals").get();
  if (!snap.exists) return null;
  return snap.data() as NewArrivalsContent;
}

const NewArrivalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  image: z.string().min(1, "Image URL is required"),
});

export async function addNewArrivalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const raw = {
    name: formData.get("name") as string,
    price: formData.get("price") as string,
    category: formData.get("category") as string,
    image: formData.get("image") as string,
  };
  const parsed = NewArrivalSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const docRef = adminDb.collection("siteContent").doc("newArrivals");
  const snap = await docRef.get();
  const existing = snap.data() as NewArrivalsContent | undefined;
  const items: NewArrivalItem[] = existing?.items ?? [];

  // New products start as DRAFT
  items.push({ id: nanoid(), ...parsed.data, order: items.length, status: "draft" });

  await docRef.set({
    items,
    status: "published",
    updatedAt: Date.now(),
    updatedBy: session.uid,
  }, { merge: true });

  revalidateTag("content:newArrivals", "max");
  revalidatePath("/admin/content/new-arrivals");
  return { success: true, message: "Product added as draft." };
}

export async function toggleNewArrivalStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const itemId = formData.get("itemId") as string;

  const docRef = adminDb.collection("siteContent").doc("newArrivals");
  const snap = await docRef.get();
  const existing = snap.data() as NewArrivalsContent | undefined;
  if (!existing) return { message: "No content found." };

  const items = existing.items.map((i) =>
    i.id === itemId ? { ...i, status: flip(i.status ?? "draft") } : i
  );
  await docRef.set({ ...existing, items, updatedAt: Date.now(), updatedBy: session.uid });

  revalidateTag("content:newArrivals", "max");
  revalidatePath("/admin/content/new-arrivals");
  revalidatePath("/");
  return { success: true };
}

export async function deleteNewArrivalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const itemId = formData.get("itemId") as string;

  const docRef = adminDb.collection("siteContent").doc("newArrivals");
  const snap = await docRef.get();
  const existing = snap.data() as NewArrivalsContent | undefined;
  if (!existing) return { message: "No content found." };

  const items = existing.items.filter((i) => i.id !== itemId);
  await docRef.set({ ...existing, items, updatedAt: Date.now(), updatedBy: session.uid });

  revalidateTag("content:newArrivals", "max");
  revalidatePath("/admin/content/new-arrivals");
  revalidatePath("/");
  return { success: true };
}

// ─── SPONSORED ───────────────────────────────────────────────────────────────

export async function getSponsoredContent(): Promise<SponsoredContent | null> {
  const snap = await adminDb.collection("siteContent").doc("sponsored").get();
  if (!snap.exists) return null;
  return snap.data() as SponsoredContent;
}

const SponsoredSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image: z.string().min(1, "Image URL is required"),
});

export async function addSponsoredSlideAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const raw = {
    title: formData.get("title") as string,
    image: formData.get("image") as string,
  };
  const parsed = SponsoredSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const docRef = adminDb.collection("siteContent").doc("sponsored");
  const snap = await docRef.get();
  const existing = snap.data() as SponsoredContent | undefined;
  const slides: SponsoredSlide[] = existing?.slides ?? [];

  // New slides start as DRAFT
  slides.push({ id: nanoid(), ...parsed.data, order: slides.length, status: "draft" });

  await docRef.set({
    slides,
    status: "published",
    updatedAt: Date.now(),
    updatedBy: session.uid,
  }, { merge: true });

  revalidateTag("content:sponsored", "max");
  revalidatePath("/admin/content/sponsored");
  return { success: true, message: "Slide added as draft." };
}

export async function toggleSponsoredSlideStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const slideId = formData.get("slideId") as string;

  const docRef = adminDb.collection("siteContent").doc("sponsored");
  const snap = await docRef.get();
  const existing = snap.data() as SponsoredContent | undefined;
  if (!existing) return { message: "No content found." };

  const slides = existing.slides.map((s) =>
    s.id === slideId ? { ...s, status: flip(s.status ?? "draft") } : s
  );
  await docRef.set({ ...existing, slides, updatedAt: Date.now(), updatedBy: session.uid });

  revalidateTag("content:sponsored", "max");
  revalidatePath("/admin/content/sponsored");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSponsoredSlideAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const slideId = formData.get("slideId") as string;

  const docRef = adminDb.collection("siteContent").doc("sponsored");
  const snap = await docRef.get();
  const existing = snap.data() as SponsoredContent | undefined;
  if (!existing) return { message: "No content found." };

  const slides = existing.slides.filter((s) => s.id !== slideId);
  await docRef.set({ ...existing, slides, updatedAt: Date.now(), updatedBy: session.uid });

  revalidateTag("content:sponsored", "max");
  revalidatePath("/admin/content/sponsored");
  revalidatePath("/");
  return { success: true };
}
