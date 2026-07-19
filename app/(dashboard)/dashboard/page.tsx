import { getCurrentUser, verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import { PRODUCTS } from "@/lib/types";
import Link from "next/link";

async function getCounts(uid: string) {
  const [wishlistSnap, cartSnap, notifSnap] = await Promise.all([
    adminDb.collection("wishlist").doc(uid).collection("items").count().get(),
    adminDb.collection("carts").doc(uid).collection("items").count().get(),
    adminDb.collection("notifications").doc(uid).collection("items").where("read", "==", false).count().get(),
  ]);
  return {
    wishlist: wishlistSnap.data().count,
    cart: cartSnap.data().count,
    unreadNotifications: notifSnap.data().count,
  };
}

const QUICK_LINKS = [
  { href: "/dashboard/orders", label: "My Orders", desc: "Track & manage", icon: "📦" },
  { href: "/dashboard/wishlist", label: "Wishlist", desc: "Items you love", icon: "♡" },
  { href: "/dashboard/addresses", label: "Addresses", desc: "Saved addresses", icon: "⊙" },
  { href: "/dashboard/support", label: "Support", desc: "Get help", icon: "◎" },
];

export default async function DashboardHome() {
  const session = await verifySession();
  const [user, counts] = await Promise.all([
    getCurrentUser(),
    getCounts(session.uid),
  ]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const trending = PRODUCTS.slice(0, 4);

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-cacao px-8 py-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/line.png')", backgroundSize: "cover" }} />
        <p className="text-white/50 text-sm tracking-[0.2em] uppercase mb-1 relative z-10">{greeting}</p>
        <h1 className="font-heading text-3xl md:text-4xl relative z-10">
          Hi, {user?.name?.split(" ")[0] ?? "there"} ✦
        </h1>
        <p className="text-white/60 text-sm mt-2 relative z-10">Welcome to your editte account</p>
        {!user?.emailVerified && (
          <div className="mt-5 inline-flex items-center gap-2 bg-rose/20 border border-rose/30 text-rose text-xs px-4 py-2 rounded-full relative z-10">
            ⚠ Email not verified
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/dashboard/wishlist" className="bg-white rounded-xl border border-ink/5 p-5 hover:border-cacao/20 hover:shadow-sm transition-all group text-center">
          <p className="text-2xl mb-2">♡</p>
          <p className="font-heading text-cacao text-2xl">{counts.wishlist}</p>
          <p className="text-xs text-ink/40 mt-1">Saved items</p>
        </Link>
        <Link href="/dashboard/cart" className="bg-white rounded-xl border border-ink/5 p-5 hover:border-cacao/20 hover:shadow-sm transition-all text-center">
          <p className="text-2xl mb-2">◻</p>
          <p className="font-heading text-cacao text-2xl">{counts.cart}</p>
          <p className="text-xs text-ink/40 mt-1">Cart items</p>
        </Link>
        <Link href="/dashboard/orders" className="bg-white rounded-xl border border-ink/5 p-5 hover:border-cacao/20 hover:shadow-sm transition-all text-center">
          <p className="text-2xl mb-2">📦</p>
          <p className="font-heading text-cacao text-2xl">0</p>
          <p className="text-xs text-ink/40 mt-1">Active orders</p>
        </Link>
        <Link href="/dashboard/notifications" className="bg-white rounded-xl border border-ink/5 p-5 hover:border-cacao/20 hover:shadow-sm transition-all text-center">
          <p className="text-2xl mb-2">🔔</p>
          <p className="font-heading text-cacao text-2xl">{counts.unreadNotifications}</p>
          <p className="text-xs text-ink/40 mt-1">Unread</p>
        </Link>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-heading text-cacao text-xl mb-5">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href}
              className="group bg-white rounded-xl p-5 border border-ink/5 hover:border-cacao/20 hover:shadow-sm transition-all">
              <span className="text-2xl mb-3 block">{item.icon}</span>
              <p className="text-sm font-heading text-cacao group-hover:text-sage transition-colors">{item.label}</p>
              <p className="text-xs text-ink/40 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile completion */}
      {(!user?.phone || !user?.dob) && (
        <div className="rounded-xl border border-sand bg-sand/30 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-heading text-cacao text-base">Complete your profile</p>
            <p className="text-ink/50 text-sm mt-1">Add your phone number and date of birth for a better experience</p>
          </div>
          <Link href="/dashboard/settings" className="shrink-0 bg-cacao text-white text-xs tracking-[0.15em] uppercase px-6 py-3 hover:bg-sage transition-colors">
            Update Profile
          </Link>
        </div>
      )}
    </div>
  );
}
