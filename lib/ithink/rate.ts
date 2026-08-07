import "server-only";

import { thinkPost } from "./client";
import type { GetRateData, IthinkResponse, RateResult } from "./types";

export async function getRate(
  params: Omit<GetRateData, "order_type">,
): Promise<IthinkResponse<RateResult[]>> {
  return thinkPost<RateResult[]>("rate/check", {
    ...params,
    order_type: "forward",
  });
}

export async function getZoneRate(
  params: Omit<GetRateData, "order_type" | "to_pincode">,
): Promise<IthinkResponse<RateResult[]>> {
  return thinkPost<RateResult[]>("rate/zone_rate", {
    ...params,
    order_type: "forward",
  });
}
