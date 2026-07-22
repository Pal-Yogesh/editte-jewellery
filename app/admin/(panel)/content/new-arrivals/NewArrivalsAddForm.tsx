"use client";
import { useActionState, useState } from "react";
import { addNewArrivalAction } from "@/app/actions/adminContent";
import MediaPicker from "@/components/admin/MediaPicker";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

const CATEGORIES = ["Rings", "Earrings", "Neckpieces", "Bangles", "Chains", "Bridal", "Sets", "Other"];

export default function NewArrivalsAddForm() {
  const [state, action, pending] = useActionState(addNewArrivalAction, undefined);
  const [imageUrl, setImageUrl] = useState("");

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <AuthInput label="Product Name" name="name" placeholder="e.g. Gold Bangles" error={state?.errors?.name} />
        <AuthInput label="Price (₹)" name="price" type="number" placeholder="e.g. 4500" error={state?.errors?.price} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-[0.15em] uppercase text-ink/60">Category</label>
        <select name="category"
          className="w-full border-b border-ink/20 bg-transparent pb-2 pt-1 text-sm text-ink outline-none focus:border-cacao transition-colors">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {state?.errors?.category && <p className="text-xs text-rose">{state.errors.category[0]}</p>}
      </div>

      <MediaPicker name="image" label="Product Image" value={imageUrl} onChange={setImageUrl} />

      {state?.message && (
        <p className={`text-sm px-4 py-2 rounded ${state.success ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"}`}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <AuthButton loading={pending} className="!w-auto !px-8">Add Product</AuthButton>
      </div>
    </form>
  );
}
