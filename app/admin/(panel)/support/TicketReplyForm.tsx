"use client";
import { useActionState, useState } from "react";
import { replyTicketAction } from "@/app/actions/adminSupport";

interface Props {
  ticketId: string;
  currentStatus: string;
}

export default function TicketReplyForm({ ticketId, currentStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(replyTicketAction, undefined);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="text-xs text-cacao border border-cacao/30 px-3 py-1.5 hover:bg-cacao hover:text-white transition-colors">
        Reply
      </button>
    );
  }

  return (
    <form action={async (fd) => { fd.set("ticketId", ticketId); await action(fd); if (state?.success) setOpen(false); }}
      className="flex flex-col gap-3 mt-3 border-t border-ink/5 pt-4">
      <input type="hidden" name="ticketId" value={ticketId} />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/40 uppercase tracking-wide">Reply to customer</label>
        <textarea name="reply" rows={3} required placeholder="Type your response…"
          className="border border-ink/20 rounded p-2 text-sm outline-none focus:border-cacao resize-none bg-salt" />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-ink/40 uppercase tracking-wide">Status</label>
        <select name="status" defaultValue={currentStatus}
          className="border border-ink/20 rounded px-2 py-1 text-xs bg-salt outline-none focus:border-cacao">
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {state?.message && (
        <p className={`text-xs px-3 py-2 rounded ${state.success ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"}`}>
          {state.message}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="bg-cacao text-white text-xs px-5 py-2 hover:bg-sage transition-colors disabled:opacity-50">
          {pending ? "Sending…" : "Send Reply"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink/40 px-3">
          Cancel
        </button>
      </div>
    </form>
  );
}
