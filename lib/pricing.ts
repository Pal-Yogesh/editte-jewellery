/** GST rate for jewellery (3% on gold/precious metals in India). */
export const GST_RATE = 0.03;

/** Minimum chargeable shipment weight for Shiprocket (kg). */
export const MIN_SHIPMENT_WEIGHT_KG = 0.5;

/** Default package dimensions (cm) — packing size not collected on products yet. */
export const DEFAULT_PACKAGE_CM = { length: 15, breadth: 12, height: 8 } as const;

/** GST amount in whole rupees (rounded). */
export function calcGst(subtotal: number): number {
  return Math.round(subtotal * GST_RATE);
}

/**
 * Amount the customer pays via Razorpay: products + GST.
 * Shipping is estimated separately and not charged at checkout.
 */
export function calcPayableTotal(subtotal: number): number {
  return subtotal + calcGst(subtotal);
}

/**
 * Converts product weight (grams) to Shiprocket weight (kg),
 * enforcing the platform minimum of 0.5 kg.
 */
export function gramsToShipmentKg(weightGrams: number): number {
  const grams = Number.isFinite(weightGrams) && weightGrams > 0 ? weightGrams : 0;
  const kg = grams / 1000;
  return Math.max(MIN_SHIPMENT_WEIGHT_KG, Math.round(kg * 1000) / 1000);
}

/**
 * Sums line-item weights (grams × qty) then applies the 0.5 kg shipment minimum.
 */
export function cartShipmentWeightKg(
  items: { weightGrams: number; quantity: number }[]
): number {
  const totalGrams = items.reduce((acc, item) => {
    const grams = Number.isFinite(item.weightGrams) && item.weightGrams > 0 ? item.weightGrams : 0;
    const qty = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 0;
    return acc + grams * qty;
  }, 0);
  return gramsToShipmentKg(totalGrams);
}
