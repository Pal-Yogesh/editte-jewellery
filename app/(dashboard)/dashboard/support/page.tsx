import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { SupportTicket } from "@/lib/types";
import RaiseTicketForm from "./RaiseTicketForm";
import TicketList from "./TicketList";
import FaqSection from "./FaqSection";
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

async function getTickets(uid: string): Promise<SupportTicket[]> {
  try {
    // Simple query without orderBy to avoid requiring a composite index
    const snap = await adminDb
      .collection("supportTickets")
      .where("uid", "==", uid)
      .get();
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<SupportTicket, "id">) }))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export default async function SupportPage() {
  const session = await verifySession();
  const tickets = await getTickets(session.uid);

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div>
        <h1 className="font-heading text-cacao text-3xl">Support</h1>
        <p className="text-ink/50 text-sm mt-1">We&apos;re here to help</p>
      </div>

      {/* Contact info */}
      <div className="bg-sand/40 rounded-xl border border-sand p-5 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">📧</span>
          <div>
            <p className="text-xs text-ink/40 uppercase tracking-wide">Email Support</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-cacao hover:text-sage transition-colors">
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
        <div className="sm:border-l sm:border-sand sm:pl-4 flex items-center gap-3">
          <span className="text-xl">📞</span>
          <div>
            <p className="text-xs text-ink/40 uppercase tracking-wide">Phone Support</p>
            <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} className="text-sm text-cacao hover:text-sage transition-colors">
              {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </div>

      {/* My Tickets */}
      {tickets.length > 0 && (
        <section>
          <h2 className="font-heading text-cacao text-xl mb-4">My Tickets</h2>
          <TicketList tickets={tickets} />
        </section>
      )}

      {/* Raise a ticket */}
      <section className="bg-white rounded-xl border border-ink/5 p-6 md:p-8">
        <h2 className="font-heading text-cacao text-lg mb-1">Raise a Support Ticket</h2>
        <p className="text-ink/40 text-sm mb-6">Attach screenshots or documents to help us resolve faster</p>
        <RaiseTicketForm />
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-heading text-cacao text-xl mb-5">Frequently Asked Questions</h2>
        <FaqSection />
      </section>
    </div>
  );
}
