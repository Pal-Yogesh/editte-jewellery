import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";
import type { Order } from "@/lib/types";

function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getSession();
  if (!session?.uid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { orderId } = await params;
  const snap = await adminDb.collection("orders").doc(orderId).get();

  if (!snap.exists) {
    return new NextResponse("Order not found", { status: 404 });
  }

  const order = { id: snap.id, ...snap.data() } as Order;

  // Security: only the owner can download
  if (order.uid !== session.uid) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const itemsHtml = order.items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9f5f1" : "#ffffff"}">
        <td style="padding:10px 14px;font-size:13px;">${item.name}</td>
        <td style="padding:10px 14px;font-size:13px;text-align:center;">${item.category}</td>
        <td style="padding:10px 14px;font-size:13px;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 14px;font-size:13px;text-align:right;">${formatCurrency(item.price)}</td>
        <td style="padding:10px 14px;font-size:13px;text-align:right;font-weight:600;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${order.invoiceNumber} — editte</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; color: #361515; background: #fff; padding: 48px 56px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand { font-size: 28px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; }
    .tagline { font-size: 11px; color: #888; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 4px; }
    .invoice-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.18em; color: #888; text-align: right; }
    .invoice-num { font-size: 20px; font-weight: 700; text-align: right; margin-top: 4px; }
    .divider { border: none; border-top: 2px solid #361515; margin: 24px 0; }
    .divider-light { border: none; border-top: 1px solid #ede2c3; margin: 24px 0; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #888; margin-bottom: 4px; }
    .meta-value { font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead tr { background: #361515; color: #f9f5f1; }
    thead th { padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; text-align: left; font-weight: 600; }
    thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: center; }
    thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
    .total-row { background: #361515; color: #f9f5f1; }
    .total-row td { padding: 12px 14px; font-size: 14px; font-weight: 700; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #ede2c3; font-size: 11px; color: #888; display: flex; justify-content: space-between; }
    .paid-badge { display: inline-block; background: #b3ad6e; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; padding: 3px 10px; border-radius: 20px; margin-left: 8px; vertical-align: middle; }
    @media print {
      body { padding: 24px; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand">editte</div>
      <div class="tagline">Fine Jewellery Collective</div>
    </div>
    <div>
      <div class="invoice-title">Tax Invoice</div>
      <div class="invoice-num">${order.invoiceNumber} <span class="paid-badge">Paid</span></div>
    </div>
  </div>

  <hr class="divider" />

  <!-- Billing info -->
  <div class="meta-grid">
    <div>
      <div class="meta-label">Billed To</div>
      <div class="meta-value" style="font-weight:600;">${order.userName}</div>
      <div class="meta-value" style="color:#888;">${order.userEmail}</div>
    </div>
    <div style="text-align:right;">
      <div class="meta-label">Invoice Date</div>
      <div class="meta-value">${orderDate}</div>
      <div style="margin-top:12px;">
        <div class="meta-label">Payment ID</div>
        <div class="meta-value" style="font-size:11px;font-family:monospace;">${order.razorpayPaymentId}</div>
      </div>
      <div style="margin-top:8px;">
        <div class="meta-label">Order ID</div>
        <div class="meta-value" style="font-size:11px;font-family:monospace;">${order.razorpayOrderId}</div>
      </div>
    </div>
  </div>

  <!-- Items table -->
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Category</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="padding:10px 14px;font-size:12px;color:#888;text-align:right;background:#f9f5f1;">
          Subtotal
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#888;text-align:right;background:#f9f5f1;">
          <strong>${formatCurrency(order.subtotal)}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="padding:10px 14px;font-size:12px;color:#888;text-align:right;background:#f9f5f1;">
          GST (3%)
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#888;text-align:right;background:#f9f5f1;">
          <strong>${formatCurrency(order.gst ?? Math.round(order.subtotal * 0.03))}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="padding:10px 14px;font-size:12px;color:#888;text-align:right;background:#f9f5f1;">
          Shipping
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#888;text-align:right;background:#f9f5f1;">
          Arranged separately
        </td>
      </tr>
      <tr class="total-row">
        <td colspan="4" style="text-align:right;letter-spacing:0.08em;">Total Paid (INR)</td>
        <td style="text-align:right;">${formatCurrency(order.total)}</td>
      </tr>
    </tfoot>
  </table>

  <hr class="divider-light" />

  <!-- Footer -->
  <div class="footer">
    <div>
      editte — India's first jewellery makers collective<br/>
      This is a computer-generated invoice.
    </div>
    <div style="text-align:right;">
      Thank you for shopping with editte ✦
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="editte-invoice-${order.invoiceNumber}.html"`,
    },
  });
}
