"use client";
import { useActionState } from "react";
import { createTicketAction } from "@/app/actions/support";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

const CATEGORIES = [
  { value: "order", label: "Order Issue" },
  { value: "return", label: "Return / Exchange" },
  { value: "payment", label: "Payment" },
  { value: "other", label: "Other" },
] as const;

export default function RaiseTicketForm() {
  const [state, action, pending] = useActionState(createTicketAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-[0.15em] uppercase text-ink/60">Category</label>
        <select
          name="category"
          className="w-full border-b border-ink/20 bg-transparent pb-2 pt-1 text-sm text-ink outline-none focus:border-cacao transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        {state?.errors?.category && <p className="text-xs text-rose">{state.errors.category[0]}</p>}
      </div>

      <AuthInput
        label="Subject"
        name="subject"
        placeholder="Brief description of your issue"
        error={state?.errors?.subject}
      />

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-[0.15em] uppercase text-ink/60">Message</label>
        <textarea
          name="message"
          rows={5}
          placeholder="Describe your issue in detail..."
          className={`w-full border-b bg-transparent pb-2 pt-1 text-sm text-ink outline-none transition-colors resize-none placeholder:text-ink/30 ${state?.errors?.message ? "border-rose" : "border-ink/20 focus:border-cacao"}`}
        />
        {state?.errors?.message && <p className="text-xs text-rose">{state.errors.message[0]}</p>}
      </div>

      {/* Attachments */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-[0.15em] uppercase text-ink/60">Attachments (optional, max 3 files)</label>
        <input
          type="file"
          name="attachments"
          multiple
          accept="image/*,.pdf"
          className="text-sm text-ink/60 file:mr-3 file:py-1.5 file:px-4 file:border file:border-ink/20 file:bg-transparent file:text-xs file:text-cacao file:uppercase file:tracking-wider hover:file:border-cacao file:transition-colors cursor-pointer"
        />
      </div>

      {state?.message && (
        <p className={`text-sm px-4 py-3 rounded ${state.success ? "text-sage bg-sage/10" : "text-rose bg-rose/10"}`}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <AuthButton loading={pending} className="!w-auto !px-8">Submit Ticket</AuthButton>
      </div>
    </form>
  );
}
