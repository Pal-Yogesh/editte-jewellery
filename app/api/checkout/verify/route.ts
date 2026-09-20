import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM } from "@/lib/resend";
import { createOrder } from "@/lib/shiprocket/order";
import type { CartItem, OrderItem } from "@/lib/types";
import type { CreateOrderPayload } from "@/lib/shiprocket/types";

function generateInvoiceNumber(): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EDT-${yy}${mm}-${rand}`;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  // ── 1. Verify signature ──────────────────────────────────────────────────
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET_TEST!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // ── 2. Fetch cart, user & delivery address ───────────────────────────────
  const [cartSnap, userSnap] = await Promise.all([
    adminDb.collection("carts").doc(session.uid).collection("items").get(),
    adminDb.collection("users").doc(session.uid).get(),
  ]);

  const cartItems = cartSnap.docs.map((d) => d.data() as CartItem);
  const userData = userSnap.data() ?? {};
  const userName: string = userData.name ?? "Customer";
  const userEmail: string = session.email;

  // Get user's default delivery address
  const addressSnap = await adminDb
    .collection("addresses")
    .doc(session.uid)
    .collection("items")
    .where("isDefault", "==", true)
    .limit(1)
    .get();

  const deliveryAddress = addressSnap.empty ? null : addressSnap.docs[0].data();

  const orderItems: OrderItem[] = cartItems.map((i) => ({
    productId: i.productId,
    name: i.name,
    image: i.image,
    price: i.price,
    quantity: i.quantity,
    category: i.category,
  }));

  const subtotal = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const invoiceNumber = generateInvoiceNumber();
  const createdAt = Date.now();

  // ── 3. Save order to Firestore ───────────────────────────────────────────
  const orderData: Record<string, unknown> = {
    uid: session.uid,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    items: orderItems,
    subtotal,
    total: subtotal,
    currency: "INR",
    status: "paid",
    userEmail,
    userName,
    invoiceNumber,
    createdAt,
  };

  // Attach delivery address if available
  if (deliveryAddress) {
    orderData.shippingAddress = {
      name: deliveryAddress.name ?? userName,
      phone: deliveryAddress.phone ?? "",
      line1: deliveryAddress.line1 ?? "",
      line2: deliveryAddress.line2 ?? "",
      city: deliveryAddress.city ?? "",
      state: deliveryAddress.state ?? "",
      pincode: deliveryAddress.pincode ?? "",
    };
  }

  const orderRef = await adminDb.collection("orders").add(orderData);

  // ── 4. Clear cart ────────────────────────────────────────────────────────
  const batch = adminDb.batch();
  cartSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  // ── 5. Create shipment via Shiprocket (best-effort) ──────────────────────
  if (!deliveryAddress) {
    await adminDb.collection("orders").doc(orderRef.id).update({
      shipmentStatus: "pending",
      shipmentNote: "No delivery address found at checkout.",
    });
  } else {
    try {
      // Get vendor's Shiprocket pickup location name (from first product's vendor)
      const firstProductId = orderItems[0]?.productId;
      let pickupLocationName = "";
      let vendorId = "";

      if (firstProductId) {
        const productDoc = await adminDb.collection("products").doc(firstProductId).get();
        vendorId = (productDoc.data()?.vendorId as string) ?? "";

        if (vendorId) {
          const vendorDoc = await adminDb.collection("vendors").doc(vendorId).get();
          pickupLocationName = (vendorDoc.data()?.shipping?.shiprocketPickupLocation as string) ?? "";
        }
      }

      if (!pickupLocationName) {
        // Vendor pickup not registered — mark order for manual processing
        await adminDb.collection("orders").doc(orderRef.id).update({
          shipmentStatus: "pending",
          shipmentNote: `Vendor pickup location not registered (vendorId: ${vendorId || "unknown"}).`,
        });
      } else {
        const fullName = (deliveryAddress.name as string) ?? userName;
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] ?? "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const payload: CreateOrderPayload = {
          order_id: invoiceNumber,
          order_date: new Date(createdAt).toISOString().split("T")[0],
          pickup_location: pickupLocationName,
          billing_customer_name: firstName,
          billing_last_name: lastName,
          billing_address: (deliveryAddress.line1 as string) ?? "",
          billing_address_2: (deliveryAddress.line2 as string) ?? "",
          billing_city: (deliveryAddress.city as string) ?? "",
          billing_pincode: (deliveryAddress.pincode as string) ?? "",
          billing_state: (deliveryAddress.state as string) ?? "",
          billing_country: "India",
          billing_email: userEmail,
          billing_phone: (deliveryAddress.phone as string) ?? "",
          shipping_is_billing: true,
          order_items: orderItems.map((item) => ({
            name: item.name,
            sku: item.productId,
            units: item.quantity,
            selling_price: item.price,
          })),
          payment_method: "Prepaid",
          sub_total: subtotal,
          length: 15,
          breadth: 12,
          height: 8,
          weight: 0.3,
        };

        const shipResult = await createOrder(payload);

        // Store AWB and courier info on the order
        const awb = shipResult.awb_code ?? "";
        const courierName = shipResult.courier_name ?? "";

        if (awb) {
          await adminDb.collection("orders").doc(orderRef.id).update({
            awb,
            courierName,
            shipmentStatus: "booked",
            shiprocketOrderId: shipResult.order_id ?? null,
            shiprocketShipmentId: shipResult.shipment_id ?? null,
          });
        } else {
          await adminDb.collection("orders").doc(orderRef.id).update({
            shipmentStatus: "pending",
            shipmentNote: "Shiprocket did not return an AWB.",
            shiprocketOrderId: shipResult.order_id ?? null,
            shiprocketShipmentId: shipResult.shipment_id ?? null,
          });
        }
      }
    } catch (err) {
      // Shipment creation is best-effort — order still succeeds
      console.error("Shiprocket shipment creation failed:", err);
      await adminDb.collection("orders").doc(orderRef.id).update({
        shipmentStatus: "failed",
        shipmentNote: `Shipment booking failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      }).catch(() => {});
    }
  }

  // ── 6. Send confirmation email ───────────────────────────────────────────
  const itemsHtml = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #ede2c3;">${item.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #ede2c3;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #ede2c3;text-align:right;">${formatCurrency(item.price)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #ede2c3;text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: userEmail,
    subject: `Order Confirmed — ${invoiceNumber} | editte`,
    html: `
      <div style="font-family:'Goudy Old Style',Georgia,serif;max-width:600px;margin:0 auto;background:#f9f5f1;padding:40px 24px;color:#361515;">
        <h1 style="font-size:28px;margin:0 0 4px;">editte</h1>
        <p style="color:#888;font-size:13px;margin:0 0 32px;">Fine Jewellery Collective</p>

        <h2 style="font-size:20px;margin:0 0 8px;">Order Confirmed ✦</h2>
        <p style="font-size:14px;color:#555;margin:0 0 24px;">
          Hi ${userName}, your payment was successful. Here are your order details.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr style="border-bottom:2px solid #361515;">
            <td style="padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Product</td>
            <td style="padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#888;text-align:center;">Qty</td>
            <td style="padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#888;text-align:right;">Price</td>
            <td style="padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#888;text-align:right;">Total</td>
          </tr>
          ${itemsHtml}
        </table>

        <div style="text-align:right;padding-top:8px;border-top:2px solid #361515;margin-bottom:32px;">
          <span style="font-size:16px;font-weight:700;">Total Paid: ${formatCurrency(subtotal)}</span>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#555;margin-bottom:32px;">
          <tr>
            <td style="padding:4px 0;color:#888;">Invoice No.</td>
            <td style="padding:4px 0;text-align:right;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#888;">Order ID</td>
            <td style="padding:4px 0;text-align:right;">${razorpay_order_id}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#888;">Payment ID</td>
            <td style="padding:4px 0;text-align:right;">${razorpay_payment_id}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#888;">Date</td>
            <td style="padding:4px 0;text-align:right;">${new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
          </tr>
        </table>

        <p style="font-size:13px;color:#888;">
          You can download your invoice from your <strong>editte Dashboard → My Orders</strong>.
          For any queries, reply to this email or contact support.
        </p>

        <p style="font-size:12px;color:#bbb;margin-top:32px;border-top:1px solid #ede2c3;padding-top:16px;">
          editte — India's first jewellery makers collective
        </p>
      </div>`,
  });

  // ── 7. Add in-app notification ───────────────────────────────────────────
  await adminDb
    .collection("notifications")
    .doc(session.uid)
    .collection("items")
    .add({
      title: `Order ${invoiceNumber} confirmed`,
      message: `Payment of ${formatCurrency(subtotal)} received. Check My Orders for details.`,
      type: "order",
      read: false,
      link: `/dashboard/orders`,
      createdAt,
    });

  return NextResponse.json({ success: true, orderId: orderRef.id, invoiceNumber });
}
