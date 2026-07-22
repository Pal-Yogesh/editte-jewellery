import { verifyAdmin, getAdminUser } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import Link from "next/link";

async function getStats() {
  const [usersSnap, ordersSnap, ticketsSnap, openTicketsSnap] = await Promise.all([
    adminDb.collection("users").count().get(),
    adminDb.collection("orders").count().get(),
    adminDb.collection("supportTickets").count().get(),
    adminDb.collection("supportTickets").where("status", "==", "open").count().get(),
  ]);

  // Recent orders (last 5)
  const recentOrdersSnap = await adminDb
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(5)
    .get();

  const recentOrders = recentOrdersSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      invoiceNumber: data.invoiceNumber as string,
      userName: data.userName as string,
      total: data.total as number,
      status: data.status as string,
      createdAt: data.createdAt as number,
    };
  });

  return {
    totalUsers: usersSnap.data().count,
    totalOrders: ordersSnap.data().count,
    totalTickets: ticketsSnap.data().count,
    openTickets: openTicketsSnap.data().count,
    recentOrders,
  };
}

const QUICK_LINKS = [
  { href: "/admin/content", label: "Manage Content",   desc: "Hero, New Arrivals, Sponsored", icon: "✎", color: "bg-sage/10 border-sage/20" },
  { href: "/admin/media",   label: "Media Library",    desc: "Upload & organise files",        icon: "⊞", color: "bg-sand/40 border-sand" },
  { href: "/admin/users",   label: "Users",            desc: "Manage accounts & roles",        icon: "👤", color: "bg-cacao/5 border-cacao/10" },
  { href: "/admin/support", label: "Support Tickets",  desc: "Respond to customers",           icon: "◎", color: "bg-rose/10 border-rose/20" },
];

export default async function AdminHome() {
  await verifyAdmin();
  const [user, stats] = await Promise.all([getAdminUser(), getStats()]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div className="rounded-2xl bg-cacao px-8 py-9 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/line.png')", backgroundSize: "cover" }} />
        <p className="text-white/50 text-xs tracking-[0.25em] uppercase mb-1 relative z-10">{greeting}</p>
        <h1 className="font-heading text-3xl md:text-4xl relative z-10">
          {user?.name?.split(" ")[0] ?? "Admin"} ✦
        </h1>
        <p className="text-white/50 text-sm mt-1 relative z-10">editte Admin Panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users",     value: stats.totalUsers,   href: "/admin/users",   icon: "👤" },
          { label: "Total Orders",    value: stats.totalOrders,  href: "/admin/orders",  icon: "📦" },
          { label: "All Tickets",     value: stats.totalTickets, href: "/admin/support", icon: "◎" },
          { label: "Open Tickets",    value: stats.openTickets,  href: "/admin/support", icon: "⚠",
            highlight: stats.openTickets > 0 },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`bg-white rounded-xl border p-5 text-center hover:shadow-sm transition-all
              ${stat.highlight ? "border-rose/30 bg-rose/5" : "border-ink/5 hover:border-cacao/20"}`}
          >
            <p className="text-2xl mb-2">{stat.icon}</p>
            <p className={`font-heading text-2xl ${stat.highlight ? "text-rose" : "text-cacao"}`}>
              {stat.value}
            </p>
            <p className="text-xs text-ink/40 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-heading text-cacao text-xl mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl border p-5 hover:shadow-sm transition-all group ${item.color}`}
            >
              <span className="text-2xl mb-3 block">{item.icon}</span>
              <p className="font-heading text-cacao text-sm group-hover:text-sage transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-ink/40 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-cacao text-xl">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-ink/40 hover:text-cacao transition-colors">
            View all →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink/5 px-6 py-10 text-center">
            <p className="text-ink/40 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-ink/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/5 bg-salt">
                  <th className="text-left px-5 py-3 text-xs text-ink/40 tracking-[0.12em] uppercase font-normal">Invoice</th>
                  <th className="text-left px-5 py-3 text-xs text-ink/40 tracking-[0.12em] uppercase font-normal">Customer</th>
                  <th className="text-right px-5 py-3 text-xs text-ink/40 tracking-[0.12em] uppercase font-normal">Amount</th>
                  <th className="text-center px-5 py-3 text-xs text-ink/40 tracking-[0.12em] uppercase font-normal">Status</th>
                  <th className="text-right px-5 py-3 text-xs text-ink/40 tracking-[0.12em] uppercase font-normal">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order, i) => (
                  <tr key={order.id} className={`border-b border-ink/5 last:border-0 ${i % 2 === 1 ? "bg-salt/50" : ""}`}>
                    <td className="px-5 py-3 font-heading text-cacao text-xs">{order.invoiceNumber}</td>
                    <td className="px-5 py-3 text-ink/70">{order.userName}</td>
                    <td className="px-5 py-3 text-right font-heading text-cacao">₹{order.total.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === "paid" ? "bg-sage/20 text-sage" :
                        order.status === "failed" ? "bg-rose/20 text-rose" :
                        "bg-sand text-cacao"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-ink/40">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
