"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DevAutofill from "./dev-autofill";
import ProductsPanel from "./products-panel";
import InventoryPanel from "./inventory-panel";
import DashboardShell, { type ShellNavItem } from "@/app/components/dashboard-shell";
import {
  banner as bannerClass,
  buttonChipActive,
  buttonChipInactive,
  buttonDanger,
  buttonOutline,
  buttonPrimary,
  chipBase,
  input,
  label as labelClass,
  linkMuted,
  panel,
  sidebarButton,
  statusBanner,
  subheading,
  textarea,
} from "@/app/theme";

type SocialLinks = {
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
};

type VendorDoc = {
  id: string;
  name: string;
  contentType: string;
  uploadedAt: string;
  url: string;
};

type Vendor = {
  vendorId: string;
  email: string;
  emailVerified: boolean;
  status: "incomplete" | "pending" | "under_review" | "approved" | "rejected";
  rejectionReason: string | null;
  completeness: { complete: boolean; missing: string[] };
  profile: {
    brandName: string;
    brandStory: string;
    about: string;
    logoUrl: string;
    socialLinks: SocialLinks;
  };
  kyc: { gstNumber: string; panNumber: string; documents: VendorDoc[] };
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  pickupAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  commission: { accepted: boolean; acceptedAt: string | null };
};

const MAX_DOCUMENTS = 10;

const TABS = [
  { id: "profile", label: "Brand Profile" },
  { id: "kyc", label: "KYC & Documents" },
  { id: "bank", label: "Bank Details" },
  { id: "address", label: "Pickup Address" },
  { id: "commission", label: "Commission" },
  { id: "account", label: "Account" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const inputClass = input;
const primaryBtn = buttonPrimary;
const outlineBtn = buttonOutline;

export default function VendorDashboardPage() {
  const router = useRouter();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<"account" | "products" | "inventory">("account");
  const [uploadQueueCount, setUploadQueueCount] = useState(0);
  const [tab, setTab] = useState<TabId>("profile");
  const [banner, setBanner] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Section-local form state
  const [profileForm, setProfileForm] = useState({
    brandName: "",
    brandStory: "",
    about: "",
    social: {} as SocialLinks,
  });
  const [kycForm, setKycForm] = useState({ gstNumber: "", panNumber: "" });
  const [bankForm, setBankForm] = useState({
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
  });
  const [addressForm, setAddressForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [docName, setDocName] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const hydrate = useCallback((v: Vendor) => {
    setVendor(v);
    setProfileForm({
      brandName: v.profile.brandName,
      brandStory: v.profile.brandStory,
      about: v.profile.about,
      social: v.profile.socialLinks ?? {},
    });
    setKycForm({ gstNumber: v.kyc.gstNumber, panNumber: v.kyc.panNumber });
    setBankForm({ ...v.bankDetails });
    setAddressForm({ ...v.pickupAddress });
  }, []);

  const loadVendor = useCallback(async () => {
    try {
      const res = await fetch("/api/vendor/me", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        router.replace("/vendor/login");
        return;
      }
      hydrate(data.vendor as Vendor);
    } catch {
      router.replace("/vendor/login");
    } finally {
      setLoading(false);
    }
  }, [router, hydrate]);

  useEffect(() => {
    void loadVendor();
  }, [loadVendor]);

  const notify = (text: string, error = false) => setBanner({ text, error });

  const request = async (
    url: string,
    options: RequestInit,
    successMsg: string
  ) => {
    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) {
        notify(data.message || "Something went wrong.", true);
        return false;
      }
      if (data.vendor) hydrate(data.vendor as Vendor);
      notify(data.message || successMsg);
      return true;
    } catch {
      notify("Request failed. Please try again.", true);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveJson = (url: string, method: string, body: unknown, msg: string) =>
    request(
      url,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      msg
    );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVendor();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await fetch("/api/vendor/logout", { method: "POST" });
    router.replace("/vendor/login");
    router.refresh();
  };

  const handleLogoUpload = async (file: File) => {
    const form = new FormData();
    form.append("logo", file);
    await request("/api/vendor/logo", { method: "POST", body: form }, "Logo uploaded.");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleDocUpload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("name", docName || file.name);
    const ok = await request(
      "/api/vendor/documents",
      { method: "POST", body: form },
      "Document uploaded."
    );
    if (ok) setDocName("");
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    await request(
      "/api/vendor/submit",
      { method: "POST" },
      "Profile submitted for approval."
    );
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/vendor/account", { method: "DELETE" });
      if (res.ok) {
        router.replace("/vendor/signup");
        router.refresh();
      } else {
        notify("Failed to delete account.", true);
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading your dashboard...</p>
      </main>
    );
  }

  if (!vendor) return null;

  const statusStyles: Record<Vendor["status"], string> = statusBanner;
  const statusText: Record<Vendor["status"], string> = {
    incomplete:
      "Complete every section below, then submit your profile for admin approval.",
    pending:
      "Your profile has been submitted and is awaiting admin approval.",
    under_review:
      "Your profile is under review. We'll notify you once a decision is made.",
    approved: "Your account has been approved. You're all set!",
    rejected: `Your account was rejected. ${vendor.rejectionReason ?? ""}`,
  };

  const canSubmit =
    (vendor.status === "incomplete" || vendor.status === "rejected") &&
    vendor.completeness.complete;
  const showSubmitCard =
    vendor.status === "incomplete" || vendor.status === "rejected";

  const navItems: readonly ShellNavItem[] = [
    { id: "account", label: "Account & Details", icon: "⚙" },
    { id: "products", label: "Products", icon: "◻", badge: uploadQueueCount },
    { id: "inventory", label: "Inventory", icon: "⊙" },
  ];

  return (
    <DashboardShell
      subtitle="Vendor Portal"
      items={navItems}
      active={section}
      onSelect={(id) =>
        setSection(id as "account" | "products" | "inventory")
      }
      meta={
        <>
          <p className="truncate font-heading text-sm text-white/90">
            {vendor.profile.brandName || "Vendor"}
          </p>
          <p className="mt-0.5 truncate text-xs text-white/40">{vendor.email}</p>
        </>
      }
      headerAction={
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="shrink-0 text-white/40 transition-colors hover:text-white disabled:opacity-40"
          title="Refresh data"
        >
          <span className={refreshing ? "inline-block animate-spin" : ""}>↻</span>
        </button>
      }
      footer={
        <button
          type="button"
          onClick={handleLogout}
          className={sidebarButton}
        >
          <span className="w-5 text-center text-base">→</span>
          {busy ? "Signing out…" : "Sign out"}
        </button>
      }
    >
      {/* Both panels stay mounted so the upload queue survives section switches. */}
          <div className={section !== "products" ? "hidden" : ""}>
            <ProductsPanel
              vendorStatus={vendor.status}
              brandName={vendor.profile.brandName}
              onQueueChange={setUploadQueueCount}
            />
          </div>
          <div className={section !== "inventory" ? "hidden" : ""}>
            <InventoryPanel />
          </div>
          <div className={section === "products" || section === "inventory" ? "hidden" : ""}>
              <div className={`mb-6 ${statusStyles[vendor.status]}`}>
          <span className="uppercase tracking-[0.15em]">{vendor.status.replace("_", " ")}</span> — {statusText[vendor.status]}
        </div>

        {process.env.NODE_ENV !== "production" ? (
          <DevAutofill onDone={loadVendor} />
        ) : null}

        {showSubmitCard ? (
          <div className="mb-6 rounded-xl border border-border bg-surface p-5">
            {vendor.completeness.complete ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-foreground">
                  All required sections are complete. Submit your profile for admin
                  approval.
                </p>
                <button
                  type="button"
                  disabled={busy || !canSubmit}
                  onClick={handleSubmit}
                  className={buttonPrimary}
                >
                  {busy ? "Submitting..." : "Submit for approval"}
                </button>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-heading">
                  Complete these {vendor.completeness.missing.length} item(s) to submit
                  for approval:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted">
                  {vendor.completeness.missing.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <nav className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setBanner(null);
              }}
              className={`${chipBase} ${
                tab === t.id ? buttonChipActive : buttonChipInactive
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {banner ? (
          <p className={`mb-6 ${bannerClass(banner.error)}`}>
            {banner.text}
          </p>
        ) : null}

        <section className={panel}>
          {tab === "profile" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {vendor.profile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vendor.profile.logoUrl}
                    alt="Brand logo"
                    className="h-16 w-16 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-input text-xs text-muted">
                    Logo
                  </div>
                )}
                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleLogoUpload(f);
                    }}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => logoInputRef.current?.click()}
                    className={outlineBtn}
                  >
                    Upload logo
                  </button>
                  <p className="mt-1 text-xs text-muted">
                    PNG, JPEG, WebP or SVG, up to 5 MB.
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Brand name</label>
                <input
                  className={inputClass}
                  value={profileForm.brandName}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, brandName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Brand story</label>
                <textarea
                  className={textarea}
                  value={profileForm.brandStory}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, brandStory: e.target.value }))
                  }
                  placeholder="Tell customers the story behind your brand."
                />
              </div>
              <div>
                <label className={labelClass}>About</label>
                <textarea
                  className={textarea}
                  value={profileForm.about}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, about: e.target.value }))
                  }
                  placeholder="A short description about your brand."
                />
              </div>

              <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                {(["website", "instagram", "facebook", "youtube", "twitter"] as const).map(
                  (key) => (
                    <div key={key}>
                      <label className={`${labelClass} capitalize`}>{key}</label>
                      <input
                        className={inputClass}
                        value={profileForm.social[key] ?? ""}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            social: { ...p.social, [key]: e.target.value },
                          }))
                        }
                        placeholder={`https://...`}
                      />
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                disabled={busy}
                className={primaryBtn}
                onClick={() =>
                  saveJson(
                    "/api/vendor/profile",
                    "PUT",
                    {
                      brandName: profileForm.brandName,
                      brandStory: profileForm.brandStory,
                      about: profileForm.about,
                      socialLinks: profileForm.social,
                    },
                    "Profile saved."
                  )
                }
              >
                {busy ? "Saving..." : "Save profile"}
              </button>
            </div>
          ) : null}

          {tab === "kyc" ? (
            <div className="space-y-6">
              <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>GST number</label>
                  <input
                    className={inputClass}
                    value={kycForm.gstNumber}
                    onChange={(e) =>
                      setKycForm((k) => ({ ...k, gstNumber: e.target.value }))
                    }
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className={labelClass}>PAN number</label>
                  <input
                    className={inputClass}
                    value={kycForm.panNumber}
                    onChange={(e) =>
                      setKycForm((k) => ({ ...k, panNumber: e.target.value }))
                    }
                    placeholder="AAAAA0000A"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                className={primaryBtn}
                onClick={() =>
                  saveJson("/api/vendor/documents", "PUT", kycForm, "KYC saved.")
                }
              >
                {busy ? "Saving..." : "Save KYC details"}
              </button>

              <hr className="border-border" />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className={subheading}>
                    Business documents
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
                    {vendor.kyc.documents.length}/{MAX_DOCUMENTS} uploaded
                  </span>
                </div>

                {vendor.kyc.documents.length ? (
                  <ul className="mb-4 space-y-2">
                    {vendor.kyc.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm"
                      >
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`truncate ${linkMuted}`}
                        >
                          {doc.name}
                        </a>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            saveJson(
                              "/api/vendor/documents",
                              "DELETE",
                              { documentId: doc.id },
                              "Document removed."
                            )
                          }
                          className="ml-3 shrink-0 text-[10px] uppercase tracking-[0.15em] text-danger transition-colors hover:opacity-70"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-4 text-sm text-muted">
                    No documents uploaded yet. Upload GST, PAN, or other business proof.
                  </p>
                )}

                {vendor.kyc.documents.length < MAX_DOCUMENTS ? (
                  <div className="space-y-2">
                    <input
                      className={inputClass}
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="Document label (e.g. GST Certificate)"
                    />
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleDocUpload(f);
                      }}
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => docInputRef.current?.click()}
                      className={outlineBtn}
                    >
                      Upload document
                    </button>
                    <p className="text-xs text-muted">
                      PDF, Word (.doc/.docx), PNG, JPEG or WebP, up to 10 MB each.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === "bank" ? (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Account holder name</label>
                <input
                  className={inputClass}
                  value={bankForm.accountHolder}
                  onChange={(e) =>
                    setBankForm((b) => ({ ...b, accountHolder: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Account number</label>
                  <input
                    className={inputClass}
                    value={bankForm.accountNumber}
                    onChange={(e) =>
                      setBankForm((b) => ({ ...b, accountNumber: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>IFSC code</label>
                  <input
                    className={inputClass}
                    value={bankForm.ifsc}
                    onChange={(e) => setBankForm((b) => ({ ...b, ifsc: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Bank name</label>
                <input
                  className={inputClass}
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm((b) => ({ ...b, bankName: e.target.value }))
                  }
                />
              </div>
              <button
                type="button"
                disabled={busy}
                className={primaryBtn}
                onClick={() =>
                  saveJson("/api/vendor/bank", "PUT", bankForm, "Bank details saved.")
                }
              >
                {busy ? "Saving..." : "Save bank details"}
              </button>
            </div>
          ) : null}

          {tab === "address" ? (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Address line 1</label>
                <input
                  className={inputClass}
                  value={addressForm.line1}
                  onChange={(e) =>
                    setAddressForm((a) => ({ ...a, line1: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Address line 2</label>
                <input
                  className={inputClass}
                  value={addressForm.line2}
                  onChange={(e) =>
                    setAddressForm((a) => ({ ...a, line2: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    className={inputClass}
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm((a) => ({ ...a, city: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input
                    className={inputClass}
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm((a) => ({ ...a, state: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Pincode</label>
                  <input
                    className={inputClass}
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm((a) => ({ ...a, pincode: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm((a) => ({ ...a, phone: e.target.value }))
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                className={primaryBtn}
                onClick={() =>
                  saveJson(
                    "/api/vendor/address",
                    "PUT",
                    addressForm,
                    "Pickup address saved."
                  )
                }
              >
                {busy ? "Saving..." : "Save pickup address"}
              </button>
            </div>
          ) : null}

          {tab === "commission" ? (
            <div className="space-y-6">
              <h3 className={subheading}>
                Commission agreement
              </h3>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-surface-hover p-5 text-sm text-muted">
                <p className="mb-2">
                  By listing your products on this platform, you agree that a
                  commission will be deducted from each successful sale as per the
                  platform&apos;s prevailing commission schedule.
                </p>
                <p className="mb-2">
                  You agree to fulfil orders promptly, maintain accurate product
                  information, and comply with all applicable laws and platform
                  policies. The platform reserves the right to update the commission
                  rate with prior notice.
                </p>
                <p>
                  Payouts will be settled to your registered bank account after
                  deduction of applicable commission and fees.
                </p>
              </div>

              {vendor.commission.accepted ? (
                <p className={statusBanner.approved}>
                  You accepted the commission agreement
                  {vendor.commission.acceptedAt
                    ? ` on ${new Date(vendor.commission.acceptedAt).toLocaleDateString()}`
                    : ""}
                  .
                </p>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  className={primaryBtn}
                  onClick={() =>
                    saveJson(
                      "/api/vendor/commission",
                      "POST",
                      { accepted: true },
                      "Commission agreement accepted."
                    )
                  }
                >
                  {busy ? "Submitting..." : "I accept the commission agreement"}
                </button>
              )}
            </div>
          ) : null}

          {tab === "account" ? (
            <div className="space-y-6">
              <h3 className="font-heading text-xl text-danger">
                Delete account
              </h3>
              <p className="text-sm text-muted">
                Permanently delete your vendor account, profile, uploaded documents,
                and all associated data. This action cannot be undone.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={handleDeleteAccount}
                className={buttonDanger}
              >
                Delete my account
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </DashboardShell>
  );
}
