"use client";
import { useState, useActionState } from "react";
import { deleteAddressAction, setDefaultAddressAction } from "@/app/actions/addresses";
import type { Address } from "@/lib/types";
import AddressForm from "./AddressForm";

export default function AddressCard({ address }: { address: Address }) {
  const [editing, setEditing] = useState(false);
  const [deleteState, deleteAction, delPending] = useActionState(deleteAddressAction, undefined);
  const [defaultState, defaultAction, defPending] = useActionState(setDefaultAddressAction, undefined);

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-cacao/20 p-6">
        <h3 className="font-heading text-cacao text-base mb-4">Edit Address</h3>
        <AddressForm address={address} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border p-5 flex flex-col sm:flex-row gap-4 ${address.isDefault ? "border-cacao/30" : "border-ink/5"}`}>
      <div className="flex-1">
        {address.isDefault && (
          <span className="inline-block text-xs bg-cacao text-white px-2 py-0.5 rounded mb-2 tracking-wide">
            Default
          </span>
        )}
        <p className="font-heading text-cacao text-sm">{address.name}</p>
        <p className="text-ink/60 text-sm mt-1">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
        <p className="text-ink/60 text-sm">{address.city}, {address.state} — {address.pincode}</p>
        <p className="text-ink/60 text-sm">{address.country}</p>
        <p className="text-ink/50 text-xs mt-1">📞 {address.phone}</p>
      </div>

      <div className="flex sm:flex-col gap-2 items-start sm:items-end text-xs shrink-0">
        <button onClick={() => setEditing(true)} className="text-cacao hover:text-sage underline transition-colors">
          Edit
        </button>

        {!address.isDefault && (
          <form action={defaultAction}>
            <input type="hidden" name="id" value={address.id} />
            <button type="submit" disabled={defPending} className="text-ink/50 hover:text-cacao underline transition-colors disabled:opacity-50">
              {defPending ? "Setting…" : "Set default"}
            </button>
          </form>
        )}

        <form action={deleteAction}>
          <input type="hidden" name="id" value={address.id} />
          <button type="submit" disabled={delPending} className="text-rose hover:text-rose/70 underline transition-colors disabled:opacity-50">
            {delPending ? "Removing…" : "Remove"}
          </button>
        </form>
      </div>
    </div>
  );
}
