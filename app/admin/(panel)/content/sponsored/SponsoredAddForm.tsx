"use client";
import { useActionState, useState } from "react";
import { addSponsoredSlideAction } from "@/app/actions/adminContent";
import MediaPicker from "@/components/admin/MediaPicker";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

export default function SponsoredAddForm() {
  const [state, action, pending] = useActionState(addSponsoredSlideAction, undefined);
  const [imageUrl, setImageUrl] = useState("");

  return (
    <form action={action} className="flex flex-col gap-5">
      <AuthInput label="Title" name="title" placeholder="e.g. Bridal Collection" error={state?.errors?.title} />
      <MediaPicker name="image" label="Slide Image" value={imageUrl} onChange={setImageUrl} />
      {state?.message && (
        <p className={`text-sm px-4 py-2 rounded ${state.success ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"}`}>
          {state.message}
        </p>
      )}
      <div className="flex justify-end">
        <AuthButton loading={pending} className="!w-auto !px-8">Add Slide</AuthButton>
      </div>
    </form>
  );
}
