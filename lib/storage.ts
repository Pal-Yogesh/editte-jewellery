import "server-only";
import { adminStorage } from "@/lib/firebase/admin";

const SIGNED_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Generates a time-limited read URL for a Firebase Storage path. */
export async function signPath(path: string): Promise<string> {
  if (!path) return "";
  try {
    const [url] = await adminStorage
      .bucket()
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
