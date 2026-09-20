import "server-only";

import { shiprocketPost } from "./client";
import type { AddPickupPayload, AddPickupResponse } from "./types";

export async function addPickupLocation(
  payload: AddPickupPayload
): Promise<AddPickupResponse> {
  return shiprocketPost<AddPickupResponse>(
    "settings/company/addpickup",
    payload
  );
}
