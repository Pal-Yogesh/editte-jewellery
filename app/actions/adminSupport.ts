"use server";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM } from "@/lib/resend";
import { verifyAdmin } from "@/lib/dal";
import type { ActionState } from "./auth";

export async function replyTicketAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifyAdmin();
  const ticketId = formData.get("ticketId") as string;
  const reply = formData.get("reply") as string;
  const status = formData.get("status") as "open" | "in_progress" | "closed";

  if (!ticketId) return { message: "Ticket ID required." };
  if (!reply?.trim()) return { message: "Reply message is required." };

  const ticketRef = adminDb.collection("supportTickets").doc(ticketId);
  const snap = await ticketRef.get();
  if (!snap.exists) return { message: "Ticket not found." };

  const ticket = snap.data()!;

  await ticketRef.update({
    adminNote: reply.trim(),
    status: status ?? ticket.status,
    updatedAt: Date.now(),
  });

  // Email the customer
  await resend.emails.send({
    from: FROM,
    to: ticket.userEmail,
    subject: `Re: ${ticket.subject} [Ticket #${ticketId.slice(0, 8).toUpperCase()}]`,
    html: `
      <div style="font-family:'Goudy Old Style',Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#f9f5f1;color:#361515;">
        <h1 style="font-size:22px;margin:0 0 4px;">editte Support</h1>
        <p style="font-size:12px;color:#888;margin:0 0 28px;">Ticket #${ticketId.slice(0, 8).toUpperCase()}</p>
        <p style="font-size:15px;margin:0 0 8px;">Hi ${ticket.userName ?? "there"},</p>
        <p style="font-size:14px;color:#555;margin:0 0 20px;">We have responded to your support request:</p>
        <div style="background:#fff;border-left:3px solid #b3ad6e;padding:16px 20px;margin:0 0 24px;border-radius:4px;font-size:14px;line-height:1.7;">
          ${reply.trim().replace(/\n/g, "<br/>")}
        </div>
        <p style="font-size:13px;color:#888;">Status: <strong>${status?.replace("_", " ") ?? ticket.status}</strong></p>
        <p style="font-size:13px;color:#888;margin-top:16px;">You can view your ticket in your <a href="/dashboard/support" style="color:#361515;">editte dashboard</a>.</p>
      </div>`,
  });

  revalidatePath("/admin/support");
  return { success: true, message: "Reply sent and status updated." };
}

export async function updateTicketStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifyAdmin();
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as "open" | "in_progress" | "closed";
  if (!ticketId || !status) return { message: "Missing fields." };

  await adminDb.collection("supportTickets").doc(ticketId).update({ status, updatedAt: Date.now() });
  revalidatePath("/admin/support");
  return { success: true };
}
