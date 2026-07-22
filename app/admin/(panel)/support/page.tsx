import { verifyAdmin } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { SupportTicket } from "@/lib/types";
import TicketReplyForm from "./TicketReplyForm";

async function getAllTickets() {
  const snap = await adminDb.collection("supportTickets").get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<SupportTicket, "id">) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

const STATUS_STYLE: Record<SupportTicket["status"], string> = {
  open: "bg-sage/20 text-sage",
  in_progress: "bg-sand text-cacao",
  closed: "bg-ink/10 text-ink/40",
};

export default async function AdminSupportPage() {
  await verifyAdmin();
  const tickets = await getAllTickets();
  const open = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-cacao text-3xl">Support Tickets</h1>
        <div className="flex gap-3 text-sm text-ink/40">
          <span>{tickets.length} total</span>
          {open > 0 && <span className="text-rose font-heading">{open} open</span>}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink/5 px-6 py-16 text-center">
          <p className="text-ink/40 text-sm">No tickets yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-ink/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-ink/30 font-mono">#{t.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>
                      {t.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-ink/30 border border-ink/10 px-2 py-0.5 rounded-full">
                      {t.category}
                    </span>
                  </div>
                  <p className="font-heading text-cacao text-sm">{t.subject}</p>
                  <p className="text-xs text-ink/50 mt-0.5">{t.userEmail} · {t.userName}</p>
                </div>
                <p className="text-xs text-ink/30 shrink-0">
                  {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>

              <p className="text-sm text-ink/60 mt-3 leading-relaxed">{t.message}</p>

              {t.attachmentURLs?.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {t.attachmentURLs.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-cacao underline hover:text-sage transition-colors">
                      Attachment {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {t.adminNote && (
                <div className="mt-4 bg-sage/5 border border-sage/20 rounded p-3">
                  <p className="text-xs text-ink/40 uppercase tracking-wide mb-1">Previous reply</p>
                  <p className="text-sm text-ink/70">{t.adminNote}</p>
                </div>
              )}

              <TicketReplyForm ticketId={t.id} currentStatus={t.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
