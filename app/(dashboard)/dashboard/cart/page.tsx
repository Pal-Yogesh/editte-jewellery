import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { CartItem } from "@/lib/types";
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

export default async function CartPage() {
  const session = await verifySession();
  const [items, userSnap] = await Promise.all([
    getCart(session.uid),
    adminDb.collection("users").doc(session.uid).get(),
  ]);

  const userData = userSnap.data() ?? {};
  const userName: string = userData.name ?? "Customer";
  const userEmail: string = session.email;
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

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
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-ink/5 p-6 sticky top-24">
              <h2 className="font-heading text-cacao text-base mb-5">Order Summary</h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-ink/60">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-ink/60">
                  <span>Shipping</span>
                  <span className="text-sage">Free</span>
                </div>
                <div className="border-t border-ink/10 pt-3 flex justify-between font-heading text-cacao text-base">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <CheckoutButton subtotal={subtotal} userName={userName} userEmail={userEmail} />
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
