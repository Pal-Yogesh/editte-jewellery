"use client";
import { useActionState } from "react";
import { addAddressAction, updateAddressAction } from "@/app/actions/addresses";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";
import type { Address } from "@/lib/types";

interface Props {
  address?: Address;
  onCancel?: () => void;
}

export default function AddressForm({ address, onCancel }: Props) {
  const action = address ? updateAddressAction : addAddressAction;
  const [state, formAction, pending] = useActionState(action, undefined);

  const e = state?.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {address && <input type="hidden" name="id" value={address.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AuthInput label="Full Name" name="name" defaultValue={address?.name} error={e.name} />
        <AuthInput label="Phone" name="phone" type="tel" defaultValue={address?.phone} error={e.phone} />
      </div>
      <AuthInput label="Address Line 1" name="line1" defaultValue={address?.line1} error={e.line1} placeholder="House/Flat no, Street" />
      <AuthInput label="Address Line 2 (optional)" name="line2" defaultValue={address?.line2} placeholder="Landmark, Area" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <AuthInput label="City" name="city" defaultValue={address?.city} error={e.city} />
        <AuthInput label="State" name="state" defaultValue={address?.state} error={e.state} />
        <AuthInput label="Pincode" name="pincode" defaultValue={address?.pincode} error={e.pincode} maxLength={6} />
      </div>
      <input type="hidden" name="country" value="India" />

      {state?.message && (
        <p className={`text-sm px-4 py-3 rounded ${state.success ? "text-sage bg-sage/10" : "text-rose bg-rose/10"}`}>
          {state.message}
        </p>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-ink/50 px-5 py-2.5 border border-ink/20 hover:border-ink/50 transition-colors">
            Cancel
          </button>
        )}
        <AuthButton loading={pending} className="!w-auto !px-8">
          {address ? "Update Address" : "Save Address"}
        </AuthButton>
      </div>
    </form>
  );
}
