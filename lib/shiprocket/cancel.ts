import "server-only";

import { shiprocketPost } from "./client";
import type { CancelResponse } from "./types";

export async function cancelOrder(
  orderIds: number[]
): Promise<CancelResponse> {
  return shiprocketPost<CancelResponse>("orders/cancel", { ids: orderIds });
}
