import "server-only";

import { shiprocketGet } from "./client";
import type { ShipmentTrackingData } from "./types";

export async function trackByAwb(
  awb: string
): Promise<ShipmentTrackingData> {
  return shiprocketGet<ShipmentTrackingData>(`courier/track/awb/${awb}`);
}

export async function trackByShipmentId(
  shipmentId: number
): Promise<ShipmentTrackingData> {
  return shiprocketGet<ShipmentTrackingData>(
    `courier/track/shipment/${shipmentId}`
  );
}
