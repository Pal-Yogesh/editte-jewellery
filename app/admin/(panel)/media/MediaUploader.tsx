"use client";
import { useActionState, useRef, useState } from "react";
import { uploadMediaAction } from "@/app/actions/adminMedia";

export default function MediaUploader() {
  const [state, action, pending] = useActionState(uploadMediaAction, undefined);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-xl border border-ink/5 p-6">
      <h2 className="font-heading text-cacao text-base mb-4">Upload Files</h2>
      <form action={action} className="flex flex-col gap-4">
        <label
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-ink/20 rounded-xl p-8 text-center cursor-pointer hover:border-cacao/40 transition-colors"
        >
          <p className="text-3xl mb-2">⊞</p>
          <p className="text-sm text-ink/50">Click to select images or PDFs</p>
          <p className="text-xs text-ink/30 mt-1">Max 5 MB per file · up to 10 files</p>
          <input
            ref={inputRef}
            type="file"
            name="files"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setPreviews(files.filter(f => f.type.startsWith("image/")).map(f => URL.createObjectURL(f)));
            }}
          />
        </label>

        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <img key={i} src={src} alt="" className="w-16 h-16 object-cover rounded border border-ink/10" />
            ))}
          </div>
        )}

        {state?.message && (
          <p className={`text-sm px-4 py-2 rounded ${state.success ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"}`}>
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-cacao text-white text-xs tracking-[0.15em] uppercase py-3 hover:bg-sage transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pending ? (
            <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Uploading…</>
          ) : "Upload"}
        </button>
      </form>
    </div>
  );
}
