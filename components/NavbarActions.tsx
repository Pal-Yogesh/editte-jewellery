import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";
import Link from "next/link";

export default async function NavbarActions() {
  const session = await getSession();
  const isLoggedIn = !!session?.uid;

  let userName: string | null = null;
  let cartCount = 0;
  if (isLoggedIn) {
    try {
      const snap = await adminDb.collection("users").doc(session!.uid).get();
      const name = snap.data()?.name as string | undefined;
      userName = name?.split(" ")[0] ?? null;
    } catch {
      // ignore
    }
    try {
      const cartItems = await adminDb
        .collection("carts")
        .doc(session!.uid)
        .collection("items")
        .get();
      cartCount = cartItems.docs.reduce((sum, doc) => sum + (doc.data().quantity ?? 0), 0);
    } catch {
      // ignore
    }
  }

  const bagLabel = cartCount > 99 ? "99+" : String(cartCount);

  return (
    <div className="flex flex-col items-end text-xs sm:text-sm tracking-[0.18em] uppercase">
      <button className="hover:opacity-60 transition-opacity pb-1">SEARCH</button>
      <span className="w-full h-px bg-cacao/40 mb-6" />
     
      <div className="flex flex-col items-end gap-5 lg:mt-8">
        <Link
          href="/dashboard/cart"
          aria-label={cartCount > 0 ? `Bag, ${cartCount} item${cartCount > 1 ? "s" : ""}` : "Bag"}
          className="hover:opacity-60 transition-opacity flex items-center gap-1.5"
        >
          BAG
          <span className="relative inline-flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              className="w-7 h-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.9 8.4h10.2l.95 11.4a1.6 1.6 0 0 1-1.6 1.7H7.55a1.6 1.6 0 0 1-1.6-1.7L6.9 8.4Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 8.5V6.2a3 3 0 0 1 6 0V8.5"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-3 left-4.25 flex items-center justify-center min-w-6 h-6 p-1 font-bold rounded-full bg-cacao text-salt text-[16px] leading-none tracking-normal tabular-nums">
                {bagLabel}
              </span>
            )}
          </span>
        </Link>
        <Link
          href="/dashboard/wishlist"
          className="hover:opacity-60 transition-opacity"
        >
          Wishlist
        </Link>
        {isLoggedIn ? (
          <Link
            href={session!.role === "admin" ? "/admin" : "/dashboard"}
            className="hover:opacity-60 transition-opacity text-cacao font-heading"
          >
            {userName ?? "Account"}
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="hover:opacity-60 transition-opacity"
          >
            Log In
          </Link>
        )}
        <button className="hover:opacity-60 transition-opacity">HELP</button>
      </div>
    </div>
  );
}
