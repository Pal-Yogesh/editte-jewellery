import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import { trackByAwb } from "@/lib/shiprocket/tracking";
import type { Order } from "@/lib/types";
import type { ShipmentTrackingData } from "@/lib/shiprocket/types";
import Link from "next/link";

async function getOrders(uid: string): Promise<Order[]> {
  const snap = await adminDb
    .collection("orders")
    .where("uid", "==", uid)
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

async function getTrackingInfo(awb: string): Promise<ShipmentTrackingData | null> {
  if (!awb) return null;
  try {
    return await trackByAwb(awb);
  } catch {
    return null;
  }
}

const STATUS_STYLE: Record<Order["status"], string> = {
  paid: "bg-sage/20 text-sage",
  pending: "bg-sand text-cacao",
  failed: "bg-rose/20 text-rose",
};

const SHIPMENT_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Processing", color: "bg-amber-100 text-amber-700" },
  booked: { label: "Booked", color: "bg-blue-100 text-blue-700" },
  in_transit: { label: "In Transit", color: "bg-amber-100 text-amber-700" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
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

function ShippingStatus({
  order,
  tracking,
}: {
  order: Order;
  tracking: ShipmentTrackingData | null;
}) {
  // No AWB yet — show appropriate message based on status
  if (!order.awb) {
    if (order.shipmentStatus === "pending") {
      return (
        <div className="mt-3 pt-3 border-t border-ink/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-amber-700 font-medium">Shipment pending</p>
          </div>
          <p className="text-[10px] text-ink/40 mt-1">
            Your order is being processed. Shipment details will be updated soon.
          </p>
        </div>
      );
    }
    if (order.shipmentStatus === "failed") {
      return (
        <div className="mt-3 pt-3 border-t border-ink/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <p className="text-xs text-amber-700 font-medium">Shipment being arranged</p>
          </div>
          <p className="text-[10px] text-ink/40 mt-1">
            We're arranging your shipment. You'll receive tracking details once dispatched.
          </p>
        </div>
      );
    }
    return (
      <div className="mt-3 pt-3 border-t border-ink/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ink/20 animate-pulse" />
          <p className="text-xs text-ink/40">Shipment will be booked shortly.</p>
        </div>
      </div>
    );
  }

  // Has AWB — show tracking info from Shiprocket
  const statusInfo = SHIPMENT_STATUS_LABEL[order.shipmentStatus ?? "booked"] ?? SHIPMENT_STATUS_LABEL.booked;
  const trackData = tracking?.tracking_data;
  const shipmentTrack = trackData?.shipment_track?.[0];
  const activities = trackData?.shipment_track_activities ?? [];
  const liveStatus = shipmentTrack?.current_status;
  const expectedDelivery = shipmentTrack?.edd || trackData?.etd;
  const trackUrl = trackData?.track_url;
  const latestActivity = activities[0];

  return (
    <div className="mt-3 pt-3 border-t border-ink/5">
      {/* Status badge row */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className={`text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        {order.courierName && (
          <span className="text-[10px] text-ink/40">via {order.courierName}</span>
        )}
      </div>

      {/* AWB */}
      <div className="flex items-center gap-2 text-xs text-ink/50 mb-2">
        <span className="text-ink/30">AWB:</span>
        <span className="font-mono">{order.awb}</span>
        {trackUrl && (
          <a
            href={trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage underline text-[10px] ml-1"
          >
            Track ↗
          </a>
        )}
      </div>

      {/* Live tracking info */}
      {liveStatus && (
        <div className="bg-sand/30 rounded-lg px-3 py-2.5 mb-2">
          <p className="text-xs font-medium text-cacao">{liveStatus}</p>
          {latestActivity?.location && (
            <p className="text-[10px] text-ink/40 mt-0.5">{latestActivity.location}</p>
          )}
          {latestActivity?.date && (
            <p className="text-[10px] text-ink/30 mt-0.5">{latestActivity.date}</p>
          )}
        </div>
      )}

      {/* Expected delivery */}
      {expectedDelivery && (
        <p className="text-[10px] text-ink/40">
          Expected delivery: <span className="text-ink/60 font-medium">{expectedDelivery}</span>
        </p>
      )}

      {/* Recent tracking events */}
      {activities.length > 1 && (
        <details className="mt-2 group">
          <summary className="text-[10px] text-ink/40 cursor-pointer hover:text-cacao transition-colors">
            View tracking history ({activities.length} updates)
          </summary>
          <div className="mt-2 ml-2 border-l-2 border-ink/10 pl-3 space-y-2">
            {activities.slice(0, 8).map((event, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-ink/20" />
                <p className="text-[11px] text-ink/60">{event.activity ?? event.status}</p>
                <p className="text-[10px] text-ink/30">
                  {event.location && `${event.location} · `}
                  {event.date}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
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

  // Fetch tracking for orders that have an AWB (limit to recent 5 to avoid too many API calls)
  const ordersWithAwb = orders.filter((o) => o.awb).slice(0, 5);
  const trackingResults = await Promise.all(
    ordersWithAwb.map((o) => getTrackingInfo(o.awb!))
  );
  const trackingMap = new Map<string, ShipmentTrackingData | null>();
  ordersWithAwb.forEach((o, i) => {
    trackingMap.set(o.id, trackingResults[i]);
  });

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

              {/* Shipping Status */}
              {order.status === "paid" && (
                <ShippingStatus
                  order={order}
                  tracking={trackingMap.get(order.id) ?? null}
                />
              )}

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
