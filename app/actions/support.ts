"use server";
import { z } from "zod";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { verifySession, getCurrentUser } from "@/lib/dal";
import { resend, FROM } from "@/lib/resend";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./auth";

import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

const TicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Please describe your issue (min 20 characters)"),
  category: z.enum(["order", "return", "payment", "other"]),
});

export async function createTicketAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const user = await getCurrentUser();

  const raw = {
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
    category: formData.get("category") as string,
  };

  const parsed = TicketSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  // Handle attachments (up to 3, max 5MB each)
  const files = formData.getAll("attachments") as File[];
  const attachmentURLs: string[] = [];

  for (const file of files.slice(0, 3)) {
    if (file.size === 0) continue;
    if (file.size > 5 * 1024 * 1024) continue;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.type.split("/")[1] ?? "bin";
      const filePath = `tickets/${session.uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
      const bucket = adminStorage.bucket(bucketName);
      const ref = bucket.file(filePath);
      await ref.save(buffer, { metadata: { contentType: file.type }, resumable: false });

      // Use download token — works regardless of Storage rules
      const [meta] = await ref.getMetadata();
      const token = meta?.metadata?.firebaseStorageDownloadTokens as string | undefined;
      const encodedFilePath = encodeURIComponent(filePath);
      const url = token
        ? `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFilePath}?alt=media&token=${token}`
        : (() => { ref.makePublic(); return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFilePath}?alt=media`; })();
      attachmentURLs.push(url);
    } catch {
      // Skip file if upload fails — don't block ticket creation
    }
  }

  const ticketRef = await adminDb.collection("supportTickets").add({
    uid: session.uid,
    userEmail: user?.email ?? session.email,
    userName: user?.name ?? "Customer",
    ...parsed.data,
    attachmentURLs,
    status: "open",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Send confirmation email to customer
  await resend.emails.send({
    from: FROM,
    to: session.email,
    subject: `Support Ticket #${ticketRef.id.slice(0, 8).toUpperCase()} Received`,
    html: `
      <div style="font-family:'Goudy Old Style',Georgia,serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f9f5f1;color:#361515;">
        <h1 style="font-size:24px;margin:0 0 8px;">editte Support</h1>
        <p style="color:#888;margin:0 0 24px;">We've received your request</p>
        <p>Hi ${user?.name ?? "there"},</p>
        <p>Your support ticket <strong>#${ticketRef.id.slice(0, 8).toUpperCase()}</strong> has been created.</p>
        <p><strong>Subject:</strong> ${parsed.data.subject}</p>
        <p style="margin-top:24px;color:#888;">Our team will review and respond within 24–48 hours.</p>
        <p style="margin-top:24px;">For urgent queries, contact us at:<br/>
          📧 <a href="mailto:${SUPPORT_EMAIL}" style="color:#361515;">${SUPPORT_EMAIL}</a><br/>
          📞 ${SUPPORT_PHONE}
        </p>
      </div>
    `,
  });

  revalidatePath("/dashboard/support");
  return { success: true, message: `Ticket #${ticketRef.id.slice(0, 8).toUpperCase()} created. Check your email for confirmation.` };
}


