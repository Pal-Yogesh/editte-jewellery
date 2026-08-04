import "server-only";

import { thinkPost } from "./client";
import type { IthinkResponse, PincodeCheckResult } from "./types";

export async function checkPincode(
  pincode: string,
): Promise<IthinkResponse<PincodeCheckResult>> {
  return thinkPost<PincodeCheckResult>("pincode/check", { pincode });
}
