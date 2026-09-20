import "server-only";

import { shiprocketPost } from "./client";
import type { LabelResponse } from "./types";

export async function generateLabel(
  shipmentIds: number[]
): Promise<LabelResponse> {
  return shiprocketPost<LabelResponse>("courier/generate/label", {
    shipment_id: shipmentIds,
  });
}
