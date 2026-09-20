import "server-only";

import { thinkPost } from "./client";
import type { AddWarehousePayload, IthinkResponse, Warehouse } from "./types";

/**
 * Registers a new pickup warehouse with iThink Logistics.
 * The returned warehouse `id` is what orders use as `pickup_address_id`.
 */
export async function addWarehouse(
  payload: AddWarehousePayload,
): Promise<IthinkResponse<Warehouse>> {
  return thinkPost<Warehouse>("warehouse/add", payload);
}

export async function getWarehouses(): Promise<IthinkResponse<Warehouse[]>> {
  return thinkPost<Warehouse[]>("warehouse/get", {});
}
