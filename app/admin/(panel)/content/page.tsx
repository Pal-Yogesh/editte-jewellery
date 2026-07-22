import { verifyAdmin } from "@/lib/dal";
import Link from "next/link";

const SECTIONS = [
  { href: "/admin/content/hero",         label: "Hero Banner",   desc: "Manage homepage carousel slides", icon: "🖼" },
  { href: "/admin/content/new-arrivals", label: "New Arrivals",  desc: "Add / remove product cards",      icon: "✦" },
  { href: "/admin/content/sponsored",    label: "Sponsored / Events", desc: "Manage event slides",        icon: "◈" },
];

export default async function ContentPage() {
  await verifyAdmin();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-cacao text-3xl">Content Management</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href}
            className="bg-white rounded-xl border border-ink/5 p-6 hover:border-cacao/20 hover:shadow-sm transition-all group">
            <p className="text-3xl mb-3">{s.icon}</p>
            <p className="font-heading text-cacao text-base group-hover:text-sage transition-colors">{s.label}</p>
            <p className="text-xs text-ink/40 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
