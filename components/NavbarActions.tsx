import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase/admin";
import Link from "next/link";

export default async function NavbarActions() {
  const session = await getSession();
  const isLoggedIn = !!session?.uid;

  let userName: string | null = null;
  if (isLoggedIn) {
    try {
      const snap = await adminDb.collection("users").doc(session!.uid).get();
      const name = snap.data()?.name as string | undefined;
      userName = name?.split(" ")[0] ?? null;
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col items-end text-xs sm:text-sm tracking-[0.18em] uppercase">
      <button className="hover:opacity-60 transition-opacity pb-1">Search</button>
      <span className="w-full h-px bg-cacao/40 mb-6" />
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
      <div className="flex flex-col items-end gap-5 lg:mt-8">
        <button className="hover:opacity-60 transition-opacity">Bag</button>
        <button className="hover:opacity-60 transition-opacity">Help</button>
        
      </div>
    </div>
  );
}
