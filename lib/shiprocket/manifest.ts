import "server-only";

import { shiprocketPost } from "./client";
import type { ManifestResponse } from "./types";

export async function generateManifest(
  shipmentIds: number[]
): Promise<ManifestResponse> {
  return shiprocketPost<ManifestResponse>("manifests/generate", {
    shipment_id: shipmentIds,
  });
}
