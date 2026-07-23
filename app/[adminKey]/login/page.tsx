import { notFound } from "next/navigation";
import { getAdminSlug } from "@/lib/admin-slug";
import AdminLogin from "@/app/_admin/admin-login";

export default async function AdminLoginRoute({
  params,
}: {
  params: Promise<{ adminKey: string }>;
}) {
  const { adminKey } = await params;

  // Only the configured secret slug renders the admin login; anything else 404s.
  if (adminKey !== getAdminSlug()) {
    notFound();
  }

  return <AdminLogin adminKey={adminKey} />;
}
