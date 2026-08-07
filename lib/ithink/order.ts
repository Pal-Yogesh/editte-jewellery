import "server-only";

import { thinkPost } from "./client";
import type { CreateOrderPayload, CreateOrderResult, IthinkResponse } from "./types";

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<IthinkResponse<CreateOrderResult>> {
  return thinkPost<CreateOrderResult>("order/add", payload);
}
