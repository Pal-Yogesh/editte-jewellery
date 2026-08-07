import "server-only";

import { thinkPost } from "./client";
import type { IthinkResponse, LabelPayload } from "./types";

export async function printLabel(
  payload: LabelPayload,
): Promise<IthinkResponse<{ url?: string; pdf?: string }>> {
  return thinkPost<{ url?: string; pdf?: string }>("shipping/label", payload);
}
