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
