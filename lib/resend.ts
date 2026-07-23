import { Resend } from "resend";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || "noreply@yashagrawal.top";

  await resend.emails.send({
    from,
    to,
    subject: "Your Admin Login OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">Admin Login Verification</h2>
        <p style="color: #555; font-size: 14px;">Use the code below to complete your login. It expires in 5 minutes.</p>
        <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

type VendorOtpPurpose = "signup" | "login" | "reset";

const VENDOR_OTP_COPY: Record<VendorOtpPurpose, { subject: string; heading: string; intro: string }> = {
  signup: {
    subject: "Verify your vendor account",
    heading: "Verify your email",
    intro: "Use the code below to verify your email and finish creating your vendor account. It expires in 5 minutes.",
  },
  login: {
    subject: "Your vendor login code",
    heading: "Vendor login verification",
    intro: "Use the code below to complete your login. It expires in 5 minutes.",
  },
  reset: {
    subject: "Reset your vendor password",
    heading: "Password reset",
    intro: "Use the code below to reset your password. It expires in 5 minutes.",
  },
};

export type LowStockProduct = {
  title: string;
  sku: string;
  quantity: number;
  minQuantity: number;
};

export async function sendAdminVendorSubmissionAlert(
  adminEmail: string,
  vendorBrandName: string,
  vendorEmail: string
): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || "noreply@yashagrawal.top";

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `New Vendor Submission — ${vendorBrandName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">New Approval Request</h2>
        <p style="color: #555; font-size: 14px;">You have received a new vendor approval request.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #333;">Brand</td>
            <td style="padding: 8px 12px; color: #555;">${vendorBrandName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #333;">Email</td>
            <td style="padding: 8px 12px; color: #555;">${vendorEmail}</td>
          </tr>
        </table>
        <p style="color: #888; font-size: 12px;">Log in to the admin dashboard to review and take action.</p>
      </div>
    `,
  });
}

export async function sendVendorRejectionEmail(
  to: string,
  vendorBrandName: string,
  reason: string
): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || "noreply@yashagrawal.top";

  await resend.emails.send({
    from,
    to,
    subject: "Your vendor profile has been reviewed",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">Profile Update</h2>
        <p style="color: #555; font-size: 14px;">Hi ${vendorBrandName},</p>
        <p style="color: #555; font-size: 14px;">Your vendor profile has been reviewed. Here is the feedback:</p>
        <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #b91c1c; font-size: 14px;">
          ${reason}
        </div>
        <p style="color: #555; font-size: 14px;">You can update your profile and resubmit for approval from your vendor dashboard.</p>
        <p style="color: #888; font-size: 12px;">If you have any questions, please contact support.</p>
      </div>
    `,
  });
}

export async function sendLowStockAlert(
  to: string,
  vendorName: string,
  products: LowStockProduct[]
): Promise<void> {
  if (products.length === 0) return;

  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || "noreply@yashagrawal.top";

  const productRows = products
    .map(
      (p) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${p.title}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${p.sku}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center; color: #e53e3e; font-weight: bold;">${p.quantity}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${p.minQuantity}</td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from,
    to,
    subject: `⚠ Low Stock Alert — ${products.length} product(s) below minimum`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">Low Stock Alert</h2>
        <p style="color: #555; font-size: 14px;">Hi ${vendorName},</p>
        <p style="color: #555; font-size: 14px;">The following products have stock levels at or below their minimum threshold.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f4f4f5;">
              <th style="padding: 8px 12px; text-align: left; font-size: 13px;">Product</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 13px;">SKU</th>
              <th style="padding: 8px 12px; text-align: center; font-size: 13px;">Current Qty</th>
              <th style="padding: 8px 12px; text-align: center; font-size: 13px;">Min Qty</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <p style="color: #888; font-size: 12px;">Please restock soon to avoid running out of inventory.</p>
      </div>
    `,
  });
}

export async function sendVendorOtpEmail(
  to: string,
  otp: string,
  purpose: VendorOtpPurpose
): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || "noreply@yashagrawal.top";
  const copy = VENDOR_OTP_COPY[purpose];

  await resend.emails.send({
    from,
    to,
    subject: copy.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">${copy.heading}</h2>
        <p style="color: #555; font-size: 14px;">${copy.intro}</p>
        <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
