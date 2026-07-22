import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";

// ─── Customer session ─────────────────────────────────────────────────────────
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.uid) redirect("/auth/login");
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const snap = await adminDb.collection("users").doc(session.uid).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    uid: session.uid,
    email: session.email,
    emailVerified: session.emailVerified,
    role: session.role,
    name: data.name ?? "",
    photoURL: data.photoURL ?? null,
    phone: data.phone ?? null,
    dob: data.dob ?? null,
    gender: data.gender ?? null,
    createdAt: data.createdAt ?? null,
  };
});

// ─── Admin session ────────────────────────────────────────────────────────────
export const verifyAdmin = cache(async () => {
  const session = await getSession();
  if (!session?.uid) redirect("/admin/login");
  if (session.role !== "admin") redirect("/admin/login?unauthorized=1");
  return session;
});

export const getAdminUser = cache(async () => {
  const session = await verifyAdmin();
  const snap = await adminDb.collection("users").doc(session.uid).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    uid: session.uid,
    email: session.email,
    name: data.name ?? "Admin",
    photoURL: data.photoURL ?? null,
  };
});
