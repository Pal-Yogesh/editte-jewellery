"use client";

import { useActionState } from "react";
import { getShippingRateAction } from "@/app/actions/shipping";
import type { ShippingRateResult } from "@/app/actions/shipping";

interface Props {
  vendorPincode: string;
  productMrp: number;
}

export default function ShippingEstimator({ vendorPincode, productMrp }: Props) {
  const [state, action, pending] = useActionState<ShippingRateResult | undefined, FormData>(
    getShippingRateAction,
    undefined
  );

  if (!vendorPincode) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white/60 p-4">
        <p className="text-xs text-gray-400">Shipping information unavailable for this product.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white/60 p-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-3">
        Check Delivery
      </p>

      <form action={action} className="flex gap-2">
        <input type="hidden" name="from_pincode" value={vendorPincode} />
        <input type="hidden" name="product_mrp" value={productMrp} />
        <input
          type="text"
          name="to_pincode"
          placeholder="Enter your pincode"
          maxLength={6}
          pattern="\d{6}"
          required
          className="flex-1 border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#8B8B3E] focus:border-[#8B8B3E] transition-colors"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 bg-gray-900 hover:bg-gray-800 text-white text-[10px] tracking-[0.15em] uppercase font-semibold px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
        >
          {pending ? "Checking…" : "Check"}
        </button>
      </form>

      {/* Error message */}
      {state && !state.success && state.message && (
        <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-md">
          {state.message}
        </p>
      )}

      {/* Success: Show rates */}
      {state?.success && state.cheapest && (
        <div className="mt-4 space-y-3">
          {/* Cheapest rate highlighted */}
          <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-4 py-3">
            <div>
              <p className="text-xs font-medium text-green-800">
                Delivery available
              </p>
              <p className="text-[11px] text-green-600 mt-0.5">
                via {state.cheapest.logisticName}
              </p>
            </div>
            <p className="text-sm font-semibold text-green-800">
              ₹{state.cheapest.rate.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Other options (if more than 1) */}
          {state.rates && state.rates.length > 1 && (
            <details className="group">
              <summary className="text-[10px] tracking-wider uppercase text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                {state.rates.length - 1} more delivery option{state.rates.length - 1 > 1 ? "s" : ""}
              </summary>
              <div className="mt-2 space-y-1.5">
                {state.rates.slice(1).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 border border-gray-100"
                  >
                    <span className="text-xs text-gray-500">{r.logisticName}</span>
                    <span className="text-xs font-medium text-gray-700">
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
