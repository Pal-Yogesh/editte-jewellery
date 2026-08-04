import "server-only";

import { thinkPost } from "./client";
import type { IthinkResponse, TrackingResult } from "./types";

export async function trackOrder(
  awb_number_list: string,
): Promise<IthinkResponse<TrackingResult>> {
  return thinkPost<TrackingResult>("order/track", { awb_number_list });
}
