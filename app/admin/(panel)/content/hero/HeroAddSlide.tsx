"use client";
import { useActionState, useState } from "react";
import { addHeroSlideAction } from "@/app/actions/adminContent";
import MediaPicker from "@/components/admin/MediaPicker";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

export default function HeroAddSlide() {
  const [state, action, pending] = useActionState(addHeroSlideAction, undefined);
  const [url, setUrl] = useState("");

  return (
    <form action={action} className="flex flex-col gap-5">
      <MediaPicker name="url" label="Image URL" value={url} onChange={setUrl} />
      <AuthInput label="Alt text" name="alt" placeholder="Describe the image" error={state?.errors?.alt} />
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
