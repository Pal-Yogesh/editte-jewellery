import { verifyAdmin, getAdminUser } from "@/lib/dal";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export const metadata = { title: "Admin Panel — editte" };

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAdmin(); // redirects to /admin/login if not admin

  return (
    <div className="min-h-screen bg-salt flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <AdminTopbar />
        <main className="flex-1 px-5 py-8 md:px-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
