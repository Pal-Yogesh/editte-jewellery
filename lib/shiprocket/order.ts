import "server-only";

import { shiprocketPost } from "./client";
import type { CreateOrderPayload, CreateOrderResponse } from "./types";

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  return shiprocketPost<CreateOrderResponse>("orders/create/adhoc", payload);
}
