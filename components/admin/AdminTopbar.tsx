import { getAdminUser } from "@/lib/dal";
import AdminMobileNav from "./AdminMobileNav";
import Link from "next/link";

export default async function AdminTopbar() {
  let user = null;
  try { user = await getAdminUser(); } catch { /* session check done in layout */ }

  return (
    <header className="sticky top-0 z-30 bg-salt border-b border-ink/10 px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 lg:hidden">
        <AdminMobileNav />
        <span className="font-heading text-cacao text-lg tracking-[0.2em] uppercase">editte</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-xs font-heading text-cacao">{user?.name ?? "Admin"}</p>
          <p className="text-[10px] text-ink/30 uppercase tracking-wider">Administrator</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-cacao text-white text-xs flex items-center justify-center font-heading uppercase">
          {(user?.name ?? "A").charAt(0)}
        </div>
      </div>
    </header>
  );
}
