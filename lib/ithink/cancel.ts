import "server-only";

import { thinkPost } from "./client";
import type { CancelPayload, IthinkResponse } from "./types";

export async function cancelOrder(
  payload: CancelPayload,
): Promise<IthinkResponse<{ message?: string; awb_numbers?: string }>> {
  return thinkPost<{ message?: string; awb_numbers?: string }>("order/cancel", payload);
}
