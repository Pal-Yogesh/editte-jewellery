import { verifyAdmin } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/session";
import UserActions from "./UserActions";

async function getUsers() {
  const snap = await adminDb.collection("users").get();
  return snap.docs
    .map((d) => ({
      uid: d.id,
      name: (d.data().name as string) ?? "—",
      email: (d.data().email as string) ?? "—",
      role: (d.data().role as string) ?? "customer",
      createdAt: (d.data().createdAt as number) ?? 0,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export default async function UsersPage() {
  const [session] = await Promise.all([verifyAdmin()]);
  const users = await getUsers();
  const customers = users.filter((u) => u.role !== "admin");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-cacao text-3xl">Users</h1>
        <span className="text-ink/40 text-sm">{customers.length} total</span>
      </div>

      <div className="bg-white rounded-xl border border-ink/5 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-ink/5 bg-salt">
              {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-ink/40 tracking-[0.12em] uppercase font-normal whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((u, i) => (
              <tr key={u.uid} className={`border-b border-ink/5 last:border-0 ${i % 2 === 1 ? "bg-salt/50" : ""}`}>
                <td className="px-5 py-3 font-heading text-cacao whitespace-nowrap">{u.name}</td>
                <td className="px-5 py-3 text-ink/60 text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.role === "admin" ? "bg-cacao text-white" : "bg-sand text-cacao"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-ink/40 whitespace-nowrap">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  <UserActions
                    uid={u.uid}
                    role={u.role}
                    name={u.name}
                    isSelf={u.uid === session.uid}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
