import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";
import { calcPayableTotal } from "@/lib/pricing";
import type { CartItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  // Initialize inside handler so env vars are available at runtime, not build time
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID_TEST!,
    key_secret: process.env.RAZORPAY_KEY_SECRET_TEST!,
  });
  const session = await getSession();
  if (!session?.uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch cart from Firestore (never trust client-sent prices)
  const snap = await adminDb
    .collection("carts")
    .doc(session.uid)
    .collection("items")
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const items = snap.docs.map((d) => d.data() as CartItem);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  // Charge products + GST only; shipping is estimated on cart, not collected here
  const amountPaise = calcPayableTotal(subtotal) * 100;

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `rcpt_${session.uid.slice(0, 8)}_${Date.now()}`,
    notes: { uid: session.uid },
  });

  return NextResponse.json({ orderId: order.id, amount: amountPaise, currency: "INR" });
}
