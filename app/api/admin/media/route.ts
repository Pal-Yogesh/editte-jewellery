import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  const session = await getSession();
  if (!session?.uid || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const snap = await adminDb.collection("media").orderBy("createdAt", "desc").limit(100).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(items);
}
