import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";

export const metadata = { title: "My Account — editte" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession().catch(() => null);
  if (!session) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-salt flex">
      {/* Sidebar — desktop */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <DashboardTopbar />
        <main className="flex-1 px-5 py-8 md:px-10 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
