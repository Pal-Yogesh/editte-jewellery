import "server-only";

import { shiprocketGet } from "./client";
import type { ServiceabilityResponse } from "./types";

export async function checkServiceability(params: {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod?: 0 | 1;
  length?: number;
  breadth?: number;
  height?: number;
  declared_value?: number;
}): Promise<ServiceabilityResponse> {
  return shiprocketGet<ServiceabilityResponse>("courier/serviceability", {
    pickup_postcode: params.pickup_postcode,
    delivery_postcode: params.delivery_postcode,
    weight: params.weight,
    cod: params.cod ?? 0,
    length: params.length ?? 15,
    breadth: params.breadth ?? 12,
    height: params.height ?? 8,
    ...(params.declared_value ? { declared_value: params.declared_value } : {}),
  });
}
