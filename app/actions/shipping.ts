"use server";
import { checkServiceability } from "@/lib/shiprocket/rate";
import type { ActionState } from "./auth";

export interface ShippingRate {
  logisticName: string;
  rate: number;
  estimatedDays?: string;
}

export type ShippingRateResult = ActionState & {
  rates?: ShippingRate[];
  cheapest?: ShippingRate;
}

/**
 * Calculates shipping rates between a vendor's pickup pincode and
 * the customer's delivery pincode using Shiprocket serviceability API.
 *
 * Uses default jewellery package dimensions (small, lightweight items).
 */
export async function getShippingRateAction(
  _prev: ShippingRateResult | undefined,
  formData: FormData
): Promise<ShippingRateResult> {
  const fromPincode = (formData.get("from_pincode") as string)?.trim();
  const toPincode = (formData.get("to_pincode") as string)?.trim();
  const productMrp = Number(formData.get("product_mrp")) || 0;

  if (!fromPincode || !/^\d{6}$/.test(fromPincode)) {
    return { message: "Invalid seller pincode." };
  }

  if (!toPincode || !/^\d{6}$/.test(toPincode)) {
    return { message: "Please enter a valid 6-digit delivery pincode." };
  }

  if (productMrp <= 0) {
    return { message: "Invalid product price." };
  }

  try {
    const response = await checkServiceability({
      pickup_postcode: fromPincode,
      delivery_postcode: toPincode,
      weight: 0.3,
      cod: 0,
      length: 15,
      breadth: 12,
      height: 8,
      declared_value: productMrp,
    });

    const couriers = response.data?.available_courier_companies;
    if (!couriers || couriers.length === 0) {
      return { message: "Delivery not available to this pincode." };
    }

    const rates: ShippingRate[] = couriers
      .filter((c) => c.rate != null && c.rate > 0)
      .map((c) => ({
        logisticName: c.courier_name ?? "Standard",
        rate: c.rate,
        estimatedDays: c.estimated_delivery_days,
      }))
      .sort((a, b) => a.rate - b.rate);

    if (rates.length === 0) {
      return { message: "No delivery options available for this pincode." };
    }

    return {
      success: true,
      rates,
      cheapest: rates[0],
    };
  } catch (error) {
    console.error("Shipping rate check failed:", error);
    return { message: "Unable to check shipping rates. Please try again." };
  }
}
