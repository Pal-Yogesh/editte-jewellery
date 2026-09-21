"use client";

/**
 * DEV-ONLY testing helper.
 *
 * Renders an "Auto-fill form" button that populates every vendor section with
 * sample data by calling the real API endpoints (profile, logo, KYC, a sample
 * document, bank, address, commission). Useful for quickly reaching a
 * "complete" profile so you can test the submit-for-approval + admin flow
 * without manually typing everything.
 *
 * It is only rendered in development (guarded in the dashboard), so it will not
 * ship to production.
 */

import { useState } from "react";
import { buttonOutline } from "@/app/theme";

// A valid 1x1 transparent PNG, used for both the logo and a sample document.
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

function base64ToFile(base64: string, filename: string, type: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type });
}

const SAMPLE = {
  profile: {
    brandName: "Aurelia Fine Jewels",
    brandStory:
      "Founded in 2015, Aurelia crafts handmade heirloom jewellery using ethically sourced gold and conflict-free diamonds.",
    about:
      "We specialise in bridal sets, everyday gold, and bespoke commissions delivered across India.",
    socialLinks: {
      website: "https://aurelia.example.com",
      instagram: "https://instagram.com/aurelia",
      facebook: "https://facebook.com/aurelia",
      youtube: "https://youtube.com/@aurelia",
      twitter: "https://x.com/aurelia",
    },
  },
  kyc: { gstNumber: "22AAAAA0000A1Z5", panNumber: "AAAAA0000A" },
  bank: {
    accountHolder: "Aurelia Fine Jewels Pvt Ltd",
    accountNumber: "123456789012",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
  },
  address: {
    line1: "42 Zaveri Bazaar",
    line2: "Kalbadevi Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400002",
    phone: "9876543210",
  },
};

async function postJson(url: string, method: string, body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `${method} ${url} failed`);
  }
}

async function postForm(url: string, form: FormData) {
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `POST ${url} failed`);
  }
}

type DevAutofillProps = {
  onDone: () => void | Promise<void>;
};

export default function DevAutofill({ onDone }: DevAutofillProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const run = async () => {
    setBusy(true);
    setMessage("Filling every section...");

    const logoForm = new FormData();
    logoForm.append("logo", base64ToFile(TINY_PNG_BASE64, "logo.png", "image/png"));

    const docForm = new FormData();
    docForm.append(
      "file",
      base64ToFile(TINY_PNG_BASE64, "gst-certificate.png", "image/png")
    );
    docForm.append("name", "GST Certificate");

    const steps: { label: string; fn: () => Promise<void> }[] = [
      {
        label: "Profile",
        fn: () =>
          postJson("/api/vendor/profile", "PUT", {
            brandName: SAMPLE.profile.brandName,
            brandStory: SAMPLE.profile.brandStory,
            about: SAMPLE.profile.about,
            socialLinks: SAMPLE.profile.socialLinks,
          }),
      },
      { label: "Logo upload", fn: () => postForm("/api/vendor/logo", logoForm) },
      { label: "KYC numbers", fn: () => postJson("/api/vendor/documents", "PUT", SAMPLE.kyc) },
      { label: "Document upload", fn: () => postForm("/api/vendor/documents", docForm) },
      { label: "Bank", fn: () => postJson("/api/vendor/bank", "PUT", SAMPLE.bank) },
      { label: "Address", fn: () => postJson("/api/vendor/address", "PUT", SAMPLE.address) },
      {
        label: "Commission",
        fn: () => postJson("/api/vendor/commission", "POST", { accepted: true }),
      },
    ];

    const failed: string[] = [];
    for (const step of steps) {
      try {
        await step.fn();
      } catch (err) {
        const reason = err instanceof Error ? err.message : "failed";
        failed.push(step.label + " (" + reason + ")");
      }
    }

    try {
      await onDone();
    } catch {
      // ignore reload errors
    }

    if (failed.length === 0) {
      setMessage("Done — all sections filled. You can now submit for approval.");
    } else {
      setMessage(
        "Filled the text sections. " +
          failed.length +
          " step(s) failed: " +
          failed.join(", ") +
          ". File uploads require Firebase Storage to be enabled."
      );
    }
    setBusy(false);
  };

  return (
    <div className="mb-6 rounded-xl border border-dashed border-input bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-heading">Dev tools</p>
          <p className="text-xs text-muted">
            Auto-fill every section with sample data (dev only).
          </p>
        </div>
        <button type="button" onClick={run} disabled={busy} className={buttonOutline}>
          {busy ? "Filling..." : "Auto-fill form"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}
    </div>
  );
}
