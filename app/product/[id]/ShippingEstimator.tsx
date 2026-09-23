"use client";

import { useActionState } from "react";
import { getShippingRateAction } from "@/app/actions/shipping";
import type { ShippingRateResult } from "@/app/actions/shipping";

interface Props {
  vendorPincode: string;
  productMrp: number;
  weightGrams: number;
}

export default function ShippingEstimator({ vendorPincode, productMrp, weightGrams }: Props) {
  const [state, action, pending] = useActionState<ShippingRateResult | undefined, FormData>(
    getShippingRateAction,
    undefined
  );

  if (!vendorPincode) {
    return (
      <div className="border border-ink/10 bg-sand/25 p-4">
        <p className="text-xs text-ink/40">Shipping information unavailable for this product.</p>
      </div>
    );
  }

  return (
    <div className="border border-ink/10 bg-sand/25 p-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-3">
        Check Delivery
      </p>

      <form action={action} className="flex gap-2">
        <input type="hidden" name="from_pincode" value={vendorPincode} />
        <input type="hidden" name="product_mrp" value={productMrp} />
        <input type="hidden" name="weight_grams" value={weightGrams} />
        <input
          type="text"
          name="to_pincode"
          placeholder="Enter your pincode"
          maxLength={6}
          pattern="\d{6}"
          required
          className="flex-1 border border-ink/15 bg-white px-3 py-2.5 text-sm text-cacao placeholder:text-ink/30 focus:outline-none focus:border-sage transition-colors"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 bg-cacao hover:bg-sage text-white text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 transition-colors disabled:opacity-50"
        >
          {pending ? "Checking…" : "Check"}
        </button>
      </form>

      {/* Error message */}
      {state && !state.success && state.message && (
        <p className="mt-3 text-xs text-ruby bg-ruby/5 px-3 py-2">
          {state.message}
        </p>
      )}

      {/* Success: Show rates */}
      {state?.success && state.cheapest && (
        <div className="mt-4 space-y-3">
          {/* Cheapest rate highlighted */}
          <div className="flex items-center justify-between bg-sage/10 border border-sage/30 px-4 py-3">
            <div>
              <p className="text-xs text-cacao">Delivery available</p>
              <p className="text-[11px] text-ink/50 mt-0.5">
                via {state.cheapest.logisticName}
              </p>
            </div>
            <p className="text-sm text-cacao">
              ₹{state.cheapest.rate.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Other options (if more than 1) */}
          {state.rates && state.rates.length > 1 && (
            <details className="group">
              <summary className="text-[10px] tracking-wider uppercase text-ink/40 cursor-pointer hover:text-cacao transition-colors">
                {state.rates.length - 1} more delivery option{state.rates.length - 1 > 1 ? "s" : ""}
              </summary>
              <div className="mt-2 space-y-1.5">
                {state.rates.slice(1).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 bg-sand/30 border border-ink/5"
                  >
                    <span className="text-xs text-ink/50">{r.logisticName}</span>
                    <span className="text-xs text-cacao">
                      ₹{r.rate.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
