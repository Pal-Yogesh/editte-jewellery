import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { Address } from "@/lib/types";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";

async function getAddresses(uid: string): Promise<Address[]> {
  const snap = await adminDb
    .collection("addresses")
    .doc(uid)
    .collection("items")
    .orderBy("createdAt")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Address, "id">) }));
}

export default async function AddressesPage() {
  const session = await verifySession();
  const addresses = await getAddresses(session.uid);

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-cacao text-3xl">Addresses</h1>
        <span className="text-ink/40 text-sm">{addresses.length} saved</span>
      </div>

      {/* Existing addresses */}
      {addresses.length > 0 && (
        <div className="flex flex-col gap-4">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} address={addr} />
          ))}
        </div>
      )}

      {/* Add new form */}
      <section className="bg-white rounded-xl border border-ink/5 p-6 md:p-8">
        <h2 className="font-heading text-cacao text-base mb-6">
          {addresses.length === 0 ? "Add your first address" : "Add new address"}
        </h2>
        <AddressForm />
      </section>
    </div>
  );
}
