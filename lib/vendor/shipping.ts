import "server-only";

import { addPickupLocation } from "@/lib/shiprocket/pickup";
import type { VendorPickupAddress, VendorShipping } from "@/lib/vendor/types";

/**
 * Registers (or re-registers) a vendor's pickup address with Shiprocket.
 * Best-effort: never throws — on failure it returns a shipping
 * record with `registrationFailed: true` so the admin can retry later.
 */
export async function registerVendorWarehouse(
  brandName: string,
  pickupAddress: VendorPickupAddress,
): Promise<VendorShipping> {
  // Generate a unique pickup location name for this vendor
  const safeBrand = brandName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  const locationName = `Vendor_${safeBrand}_${pickupAddress.pincode}`;

  try {
    const response = await addPickupLocation({
      pickup_location: locationName,
      name: brandName,
      email: "noreply@editte.in",
      phone: pickupAddress.phone,
      address: pickupAddress.line1,
      address_2: pickupAddress.line2 || "",
      city: pickupAddress.city,
      state: pickupAddress.state,
      country: "India",
      pin_code: pickupAddress.pincode,
    });

    if (!response.success && !response.pickup_id) {
      throw new Error("Shiprocket did not confirm pickup location creation.");
    }

    return {
      shiprocketPickupLocation: locationName,
      registeredAt: new Date().toISOString(),
      registrationFailed: false,
    };
  } catch (err) {
    console.error("Shiprocket pickup registration failed:", err);
    return {
      shiprocketPickupLocation: null,
      registeredAt: null,
      registrationFailed: true,
    };
  }
}
