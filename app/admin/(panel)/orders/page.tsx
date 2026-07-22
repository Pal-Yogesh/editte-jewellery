import { verifyAdmin } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { Order } from "@/lib/types";

async function getAllOrders() {
  const snap = await adminDb.collection("orders").get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export default async function AdminOrdersPage() {
  await verifyAdmin();
  const orders = await getAllOrders();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-cacao text-3xl">Orders</h1>
        <span className="text-ink/40 text-sm">{orders.length} total</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink/5 px-6 py-16 text-center">
          <p className="text-ink/40 text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/5 bg-salt">
                {["Invoice", "Customer", "Email", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-ink/40 tracking-[0.12em] uppercase font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr key={order.id} className={`border-b border-ink/5 last:border-0 ${i % 2 === 1 ? "bg-salt/50" : ""}`}>
                  <td className="px-4 py-3 font-heading text-cacao text-xs">{order.invoiceNumber}</td>
                  <td className="px-4 py-3 text-ink/70">{order.userName}</td>
                  <td className="px-4 py-3 text-ink/50 text-xs">{order.userEmail}</td>
                  <td className="px-4 py-3 font-heading text-cacao">₹{order.total.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "paid" ? "bg-sage/20 text-sage" :
                      order.status === "failed" ? "bg-rose/20 text-rose" :
                      "bg-sand text-cacao"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/40">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
