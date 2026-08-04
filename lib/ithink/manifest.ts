import "server-only";

import { thinkPost } from "./client";
import type { IthinkResponse, ManifestPayload } from "./types";

export async function printManifest(
  payload: ManifestPayload,
): Promise<IthinkResponse<{ url?: string; pdf?: string }>> {
  return thinkPost<{ url?: string; pdf?: string }>("shipping/manifest", payload);
}
