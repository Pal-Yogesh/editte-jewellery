import type { SupportTicket } from "@/lib/types";

const STATUS_STYLES: Record<SupportTicket["status"], string> = {
  open: "bg-sage/20 text-sage",
  in_progress: "bg-sand text-cacao",
  closed: "bg-ink/10 text-ink/40",
};
const STATUS_LABELS: Record<SupportTicket["status"], string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

export default function TicketList({ tickets }: { tickets: SupportTicket[] }) {
  return (
    <div className="flex flex-col gap-3">
      {tickets.map((t) => (
        <div key={t.id} className="bg-white rounded-xl border border-ink/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-ink/30 font-mono">#{t.id.slice(0, 8).toUpperCase()}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                  {STATUS_LABELS[t.status]}
                </span>
              </div>
              <p className="font-heading text-cacao text-sm">{t.subject}</p>
              <p className="text-ink/50 text-xs mt-1 line-clamp-2">{t.message}</p>
              {t.adminNote && (
                <div className="mt-3 bg-sand/50 rounded p-3">
                  <p className="text-xs text-ink/40 uppercase tracking-wide mb-1">Response</p>
                  <p className="text-sm text-cacao">{t.adminNote}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-ink/30 shrink-0">
              {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
          {t.attachmentURLs?.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {t.attachmentURLs.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cacao underline hover:text-sage transition-colors"
                >
                  Attachment {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
