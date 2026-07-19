import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { Order } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";

async function getOrders(uid: string): Promise<Order[]> {
  const snap = await adminDb
    .collection("orders")
    .where("uid", "==", uid)
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

const STATUS_STYLE: Record<Order["status"], string> = {
  paid: "bg-sage/20 text-sage",
  pending: "bg-sand text-cacao",
  failed: "bg-rose/20 text-rose",
};

function SuccessBanner({ invoice }: { invoice: string }) {
  return (
    <div className="bg-sage/10 border border-sage/30 rounded-xl px-5 py-4 flex items-center gap-3">
      <span className="text-sage text-xl">✓</span>
      <div>
        <p className="font-heading text-cacao text-sm">Payment successful!</p>
        <p className="text-ink/50 text-xs mt-0.5">
          Invoice {invoice} confirmed. A confirmation email has been sent.
        </p>
      </div>
    </div>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; invoice?: string }>;
}) {
  const session = await verifySession();
  const [orders, params] = await Promise.all([
    getOrders(session.uid),
    searchParams,
  ]);

  const justPaid = params.success === "1";
  const invoiceParam = params.invoice ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-cacao text-3xl">My Orders</h1>
        <span className="text-ink/40 text-sm">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      {justPaid && invoiceParam && <SuccessBanner invoice={invoiceParam} />}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink/5 px-6 py-16 text-center">
          <p className="text-3xl mb-3">📦</p>
          <p className="font-heading text-cacao">No orders yet</p>
          <p className="text-ink/40 text-sm mt-1 mb-6">Your order history will appear here once you shop</p>
          <Link href="/" className="inline-block bg-cacao text-white text-xs tracking-[0.15em] uppercase px-8 py-3 hover:bg-sage transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-ink/5 p-5">
              {/* Order header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading text-cacao text-sm">{order.invoiceNumber}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink/40 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-heading text-cacao text-sm">
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                  <a
                    href={`/api/invoice/${order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cacao border border-cacao/30 px-3 py-1.5 hover:bg-cacao hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Invoice
                  </a>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden shrink-0 border border-ink/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink/70 truncate">{item.name}</p>
                      <p className="text-xs text-ink/40">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <p className="text-sm text-cacao shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Payment details */}
              <div className="mt-4 pt-3 border-t border-ink/5 grid grid-cols-2 gap-1 text-xs text-ink/40">
                <span>Payment ID</span>
                <span className="text-right font-mono truncate">{order.razorpayPaymentId}</span>
                <span>Order ID</span>
                <span className="text-right font-mono truncate">{order.razorpayOrderId}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
