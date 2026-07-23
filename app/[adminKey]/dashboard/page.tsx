import { notFound } from "next/navigation";
import { getAdminSlug } from "@/lib/admin-slug";
import AdminDashboard from "@/app/_admin/admin-dashboard";

export default async function AdminDashboardRoute({
  params,
}: {
  params: Promise<{ adminKey: string }>;
}) {
  const { adminKey } = await params;

  // Only the configured secret slug renders the admin dashboard; anything else 404s.
  if (adminKey !== getAdminSlug()) {
    notFound();
  }

  return <AdminDashboard adminKey={adminKey} />;
}
