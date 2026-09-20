import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { CartItem } from "@/lib/types";
import { checkServiceability } from "@/lib/shiprocket/rate";
import CheckoutButton from "@/components/dashboard/CheckoutButton";
import Link from "next/link";
import CartClient from "./CartClient";

// GST rate for jewellery (3% on gold/precious metals in India)
const GST_RATE = 0.03;

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

async function getVendorPincode(productId: string): Promise<string> {
  const productDoc = await adminDb.collection("products").doc(productId).get();
  if (!productDoc.exists) return "";

  const vendorId = (productDoc.data()?.vendorId as string) ?? "";
  if (!vendorId) return "";

  const vendorDoc = await adminDb.collection("vendors").doc(vendorId).get();
  if (!vendorDoc.exists) return "";

  return (vendorDoc.data()?.pickupAddress?.pincode as string) ?? "";
}

async function calculateShipping(
  items: CartItem[],
  userPincode: string
): Promise<{ shipping: number; courierName: string } | null> {
  if (!userPincode) return null;

  // Get unique product IDs and fetch their vendor pincodes
  const productIds = [...new Set(items.map((i) => i.productId))];
  const vendorPincodes = await Promise.all(productIds.map(getVendorPincode));

  // Use the first valid vendor pincode as pickup
  const fromPincode = vendorPincodes.find((p) => p && /^\d{6}$/.test(p)) ?? "";
  if (!fromPincode) return null;

  const totalMrp = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  try {
    const response = await checkServiceability({
      pickup_postcode: fromPincode,
      delivery_postcode: userPincode,
      weight: 0.3,
      cod: 0,
      length: 15,
      breadth: 12,
      height: 8,
      declared_value: totalMrp,
    });

    const couriers = response.data?.available_courier_companies;
    if (!couriers || couriers.length === 0) return null;

    // Pick the cheapest rate
    const valid = couriers.filter((c) => c.rate != null && c.rate > 0);
    if (valid.length === 0) return null;

    valid.sort((a, b) => a.rate - b.rate);
    return {
      shipping: valid[0].rate,
      courierName: valid[0].courier_name ?? "Standard",
    };
  } catch {
    return null;
  }
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
  const gst = Math.round(subtotal * GST_RATE);

  // Calculate real shipping only if user has an address
  const shippingResult = items.length > 0 && address?.pincode
    ? await calculateShipping(items, address.pincode)
    : null;

  const hasAddress = !!address;
  const shipping = shippingResult?.shipping ?? 0;
  const courierName = shippingResult?.courierName ?? "";
  const shippingKnown = hasAddress && shippingResult !== null;
  const total = subtotal + gst + (shippingKnown ? shipping : 0);

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
                    Add an address to see shipping charges and proceed to checkout.
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

                {/* Shipping */}
                <div className="flex justify-between text-ink/60">
                  <span>Shipping</span>
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

                {/* Courier info */}
                {shippingKnown && shipping > 0 && courierName && (
                  <p className="text-[10px] text-ink/30">
                    via {courierName}
                  </p>
                )}

                {/* Divider + Total */}
                <div className="border-t border-ink/10 pt-3 flex justify-between font-heading text-cacao text-base">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>

                {/* Note */}
                {!shippingKnown && hasAddress && (
                  <p className="text-[10px] text-ink/30 leading-relaxed">
                    Shipping could not be calculated for your pincode. It will be confirmed at payment.
                  </p>
                )}
              </div>

              <div className="mt-5">
                {hasAddress ? (
                  <CheckoutButton subtotal={total} userName={userName} userEmail={userEmail} />
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
