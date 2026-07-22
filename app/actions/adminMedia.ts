"use server";
import { revalidatePath } from "next/cache";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/dal";
import type { ActionState } from "./auth";

export async function uploadMediaAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const files = formData.getAll("files") as File[];
  if (!files.length || files[0].size === 0) return { message: "No files selected." };

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
  const bucket = adminStorage.bucket(bucketName);
  const uploaded: string[] = [];

  for (const file of files.slice(0, 10)) {
    if (file.size > 5 * 1024 * 1024) continue; // skip >5MB
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `media/${Date.now()}_${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const ref = bucket.file(path);

    await ref.save(buffer, { metadata: { contentType: file.type }, resumable: false });

    // Signed URL (15 years) — works with any Storage rules and bucket format
    const [url] = await ref.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 365 * 24 * 60 * 60 * 1000,
    });

    await adminDb.collection("media").add({
      filename: safeName,
      originalName: file.name,
      url,
      storagePath: path,
      type: file.type,
      size: file.size,
      uploadedBy: session.uid,
      createdAt: Date.now(),
    });

    uploaded.push(safeName);
  }

  revalidatePath("/admin/media");
  return { success: true, message: `${uploaded.length} file${uploaded.length !== 1 ? "s" : ""} uploaded.` };
}

export async function deleteMediaAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifyAdmin();
  const id = formData.get("id") as string;
  const storagePath = formData.get("storagePath") as string;
  if (!id) return { message: "Media ID required." };

  // Delete from Storage
  if (storagePath) {
    try {
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
      await adminStorage.bucket(bucketName).file(storagePath).delete();
    } catch { /* file may already be gone */ }
  }

  await adminDb.collection("media").doc(id).delete();
  revalidatePath("/admin/media");
  return { success: true };
}
