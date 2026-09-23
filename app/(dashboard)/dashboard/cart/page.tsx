import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { CartItem } from "@/lib/types";
import { checkServiceability } from "@/lib/shiprocket/rate";
import {
  calcGst,
  calcPayableTotal,
  cartShipmentWeightKg,
  DEFAULT_PACKAGE_CM,
} from "@/lib/pricing";
import CheckoutButton from "@/components/dashboard/CheckoutButton";
import Link from "next/link";
import CartClient from "./CartClient";

async function getCart(uid: string): Promise<CartItem[]> {
  const snap = await adminDb
    .collection("carts")
    .doc(uid)
    .collection("items")
    .orderBy("addedAt")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CartItem, "id">) }));
}

async function getDefaultAddress(uid: string): Promise<{ pincode: string; city: string; state: string } | null> {
  // Try default address first
  const defaultSnap = await adminDb
    .collection("addresses")
    .doc(uid)
    .collection("items")
    .where("isDefault", "==", true)
    .limit(1)
    .get();

  if (!defaultSnap.empty) {
    const data = defaultSnap.docs[0].data();
    return {
      pincode: (data.pincode as string) ?? "",
      city: (data.city as string) ?? "",
      state: (data.state as string) ?? "",
    };
  }

  // Fallback to first address
  const anySnap = await adminDb
    .collection("addresses")
    .doc(uid)
    .collection("items")
    .limit(1)
    .get();

  if (!anySnap.empty) {
    const data = anySnap.docs[0].data();
    return {
      pincode: (data.pincode as string) ?? "",
      city: (data.city as string) ?? "",
      state: (data.state as string) ?? "",
    };
  }

  return null;
}

async function getProductShippingMeta(
  productIds: string[]
): Promise<Map<string, { vendorId: string; weightGrams: number; pickupPincode: string }>> {
  const meta = new Map<string, { vendorId: string; weightGrams: number; pickupPincode: string }>();

  await Promise.all(
    productIds.map(async (id) => {
      const productDoc = await adminDb.collection("products").doc(id).get();
      if (!productDoc.exists) {
        meta.set(id, { vendorId: "", weightGrams: 0, pickupPincode: "" });
        return;
      }
      const data = productDoc.data()!;
      const vendorId = (data.vendorId as string) ?? "";
      const weightGrams = (data.weightGrams as number) ?? 0;

      let pickupPincode = "";
      if (vendorId) {
        const vendorDoc = await adminDb.collection("vendors").doc(vendorId).get();
        pickupPincode = (vendorDoc.data()?.pickupAddress?.pincode as string) ?? "";
      }

      meta.set(id, { vendorId, weightGrams, pickupPincode });
    })
  );

  return meta;
}

type VendorShipRate = {
  vendorId: string;
  rate: number;
  courierName: string;
};

/**
 * One Shiprocket rate per vendor (own pickup pincode + that vendor's items only),
 * then sum — correct for multi-vendor carts.
 */
async function calculateShipping(
  items: CartItem[],
  userPincode: string
): Promise<{ shipping: number; courierName: string; packageCount: number } | null> {
  if (!userPincode || !/^\d{6}$/.test(userPincode)) return null;

  const productIds = [...new Set(items.map((i) => i.productId))];
  const meta = await getProductShippingMeta(productIds);

  // Group cart lines by vendor
  type VendorGroup = {
    vendorId: string;
    pickupPincode: string;
    items: CartItem[];
  };
  const groups = new Map<string, VendorGroup>();

  for (const item of items) {
    const info = meta.get(item.productId);
    if (!info?.vendorId || !info.pickupPincode || !/^\d{6}$/.test(info.pickupPincode)) {
      continue;
    }
    const existing = groups.get(info.vendorId);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(info.vendorId, {
        vendorId: info.vendorId,
        pickupPincode: info.pickupPincode,
        items: [item],
      });
    }
  }

  if (groups.size === 0) return null;

  const rates: VendorShipRate[] = [];

  await Promise.all(
    [...groups.values()].map(async (group) => {
      const declaredValue = group.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const weight = cartShipmentWeightKg(
        group.items.map((i) => ({
          weightGrams: meta.get(i.productId)?.weightGrams ?? 0,
          quantity: i.quantity,
        }))
      );

      try {
        const response = await checkServiceability({
          pickup_postcode: group.pickupPincode,
          delivery_postcode: userPincode,
          weight,
          cod: 0,
          length: DEFAULT_PACKAGE_CM.length,
          breadth: DEFAULT_PACKAGE_CM.breadth,
          height: DEFAULT_PACKAGE_CM.height,
          declared_value: declaredValue,
        });

        const couriers = response.data?.available_courier_companies ?? [];
        const valid = couriers
          .filter((c) => c.rate != null && c.rate > 0)
          .sort((a, b) => a.rate - b.rate);

        if (valid[0]) {
          rates.push({
            vendorId: group.vendorId,
            rate: valid[0].rate,
            courierName: valid[0].courier_name ?? "Standard",
          });
        }
      } catch (err) {
        console.error("Vendor shipping rate failed:", group.vendorId, err);
      }
    })
  );

  // Need a successful rate for every vendor package
  if (rates.length === 0 || rates.length < groups.size) return null;

  const shipping = Math.round(rates.reduce((acc, r) => acc + r.rate, 0) * 100) / 100;
  const courierName =
    rates.length === 1
      ? rates[0].courierName
      : `${rates.length} packages`;

  return {
    shipping,
    courierName,
    packageCount: rates.length,
  };
}

export default async function CartPage() {
  const session = await verifySession();
  const [items, userSnap, address] = await Promise.all([
    getCart(session.uid),
    adminDb.collection("users").doc(session.uid).get(),
    getDefaultAddress(session.uid),
  ]);

  const userData = userSnap.data() ?? {};
  const userName: string = userData.name ?? "Customer";
  const userEmail: string = session.email;

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const gst = calcGst(subtotal);
  const payableTotal = calcPayableTotal(subtotal);

  // Shipping estimate only — not charged at checkout (handled manually / platform)
  const shippingResult = items.length > 0 && address?.pincode
    ? await calculateShipping(items, address.pincode)
    : null;

  const hasAddress = !!address;
  const shipping = shippingResult?.shipping ?? 0;
  const courierName = shippingResult?.courierName ?? "";
  const packageCount = shippingResult?.packageCount ?? 0;
  const shippingKnown = hasAddress && shippingResult !== null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-cacao text-3xl">Cart</h1>
        <span className="text-ink/40 text-sm">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink/5 px-6 py-16 text-center">
          <p className="text-4xl mb-4">◻</p>
          <p className="font-heading text-cacao text-lg">Your cart is empty</p>
          <p className="text-ink/40 text-sm mt-2 mb-6">Add items from our collections to get started</p>
          <Link href="/" className="inline-block bg-cacao text-white text-xs tracking-[0.15em] uppercase px-8 py-3 hover:bg-sage transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart items */}
          <div className="flex-1">
            <CartClient items={items} />
          </div>

          {/* Order summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-ink/5 p-6 sticky top-24">
              <h2 className="font-heading text-cacao text-base mb-5">Order Summary</h2>

              {/* Delivery address info */}
              {hasAddress ? (
                <div className="mb-4 pb-3 border-b border-ink/5">
                  <p className="text-[10px] text-ink/40 uppercase tracking-wider mb-1">Delivering to</p>
                  <p className="text-xs text-ink/70">
                    {address.city}, {address.state} — {address.pincode}
                  </p>
                  <Link href="/dashboard/addresses" className="text-[10px] text-sage underline hover:text-cacao transition-colors">
                    Change
                  </Link>
                </div>
              ) : (
                <div className="mb-4 pb-3 border-b border-ink/5 bg-amber-50/50 -mx-6 -mt-5 px-6 pt-5 rounded-t-xl">
                  <p className="text-xs text-amber-700 font-medium mb-1">No delivery address</p>
                  <p className="text-[10px] text-amber-600 mb-2">
                    Add an address to see estimated shipping and proceed to checkout.
                  </p>
                  <Link
                    href="/dashboard/addresses"
                    className="inline-block text-[10px] tracking-[0.1em] uppercase font-semibold bg-cacao text-white px-4 py-2 rounded-sm hover:bg-sage transition-colors"
                  >
                    Add Address
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-3 text-sm">
                {/* Subtotal */}
                <div className="flex justify-between text-ink/60">
                  <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {/* GST */}
                <div className="flex justify-between text-ink/60">
                  <span>GST (3%)</span>
                  <span>₹{gst.toLocaleString("en-IN")}</span>
                </div>

                {/* Payable via Razorpay */}
                <div className="border-t border-ink/10 pt-3 flex justify-between font-heading text-cacao text-base">
                  <span>You pay</span>
                  <span>₹{payableTotal.toLocaleString("en-IN")}</span>
                </div>

                {/* Shipping estimate — not charged */}
                <div className="rounded-lg bg-ink/[0.03] px-3 py-3 mt-1">
                  <div className="flex justify-between text-ink/60 text-sm">
                    <span>Est. shipping</span>
                    {!hasAddress ? (
                      <span className="text-ink/30 text-xs">—</span>
                    ) : shippingKnown ? (
                      shipping === 0 ? (
                        <span className="text-sage font-medium">Free</span>
                      ) : (
                        <span>₹{shipping.toLocaleString("en-IN")}</span>
                      )
                    ) : (
                      <span className="text-ink/30 text-xs italic">Unavailable</span>
                    )}
                  </div>
                  {shippingKnown && shipping > 0 && (
                    <p className="text-[10px] text-ink/30 mt-1">
                      {packageCount > 1
                        ? `${packageCount} shipments (one per seller) · total estimate`
                        : `via ${courierName}`}
                    </p>
                  )}
                  <p className="text-[10px] text-ink/35 mt-1.5 leading-relaxed">
                    Shipping is arranged separately and is not charged at checkout.
                  </p>
                </div>

                {!shippingKnown && hasAddress && (
                  <p className="text-[10px] text-ink/30 leading-relaxed">
                    Shipping estimate unavailable for your pincode. Delivery will still be arranged after payment.
                  </p>
                )}
              </div>

              <div className="mt-5">
                {hasAddress ? (
                  <CheckoutButton amount={payableTotal} userName={userName} userEmail={userEmail} />
                ) : (
                  <button
                    disabled
                    className="w-full bg-cacao/40 text-white text-xs tracking-[0.2em] uppercase py-3 cursor-not-allowed"
                  >
                    Add address to checkout
                  </button>
                )}
              </div>
              <Link href="/" className="block text-center mt-3 text-xs text-ink/40 hover:text-cacao transition-colors underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
