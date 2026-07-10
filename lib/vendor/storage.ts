import { randomUUID } from "crypto";
import { getBucket } from "@/lib/firebase-admin";

const SIGNED_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

export type UploadedFile = {
  path: string;
  contentType: string;
};

/**
 * Uploads a browser File to Firebase Storage under a vendor-scoped path.
 * Returns the storage path (URLs are generated on read via signPath()).
 */
export async function uploadVendorFile(
  vendorId: string,
  folder: string,
  file: File
): Promise<UploadedFile> {
  const bucket = getBucket();
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const path = `vendors/${vendorId}/${folder}/${Date.now()}-${randomUUID()}-${sanitiseName(
    file.name || "file"
  )}`;

  await bucket.file(path).save(buffer, {
    contentType,
    resumable: false,
    metadata: { contentType },
  });

  return { path, contentType };
}

/** Generates a time-limited read URL for a stored object path. */
export async function signPath(path: string): Promise<string> {
  if (!path) return "";
  try {
    const [url] = await getBucket()
      .file(path)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + SIGNED_URL_TTL_MS,
      });
    return url;
  } catch {
    return "";
  }
}

/** Best-effort deletion of a stored object. */
export async function deletePath(path: string): Promise<void> {
  if (!path) return;
  try {
    await getBucket().file(path).delete({ ignoreNotFound: true });
  } catch {
    // ignore — deletion is best-effort
  }
}

/** Deletes every object under a vendor's storage prefix. */
export async function deleteVendorFiles(vendorId: string): Promise<void> {
  try {
    await getBucket().deleteFiles({ prefix: `vendors/${vendorId}/` });
  } catch {
    // ignore — deletion is best-effort
  }
}
