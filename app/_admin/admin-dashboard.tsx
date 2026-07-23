"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buttonApprove,
  buttonChipActive,
  buttonChipInactive,
  buttonOutline,
  buttonPrimary,
  buttonReject,
  input,
  panel,
  statusBadge,
} from "@/app/theme";
import AdminProducts from "@/app/_admin/admin-products";

type AdminSessionResponse = {
  authenticated: boolean;
  role?: string;
  adminId?: string;
};

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

type VendorStatus = "pending" | "under_review" | "approved" | "rejected";

type Vendor = {
  vendorId: string;
  email: string;
  emailVerified: boolean;
  status: VendorStatus;
  rejectionReason: string | null;
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
  createdAt: string;
};

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const outlineBtn = buttonOutline;

function statusLabel(s: VendorStatus): string {
  return s === "under_review" ? "under review" : s;
}

export default function AdminDashboard({ adminKey }: { adminKey: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [section, setSection] = useState<"vendors" | "products">("vendors");

  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Rejection textarea state — keyed by vendorId
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const rejectRef = useRef<HTMLTextAreaElement>(null);

  const loadVendors = useCallback(
    async (status: StatusFilter, { silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setVendorsLoading(true);
      setError("");
      try {
        const query = status === "all" ? "" : `?status=${status}`;
        const res = await fetch(`/api/admin/vendors${query}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load vendors.");
          return;
        }
        setVendors(data.vendors as Vendor[]);
        setLastUpdated(new Date());
      } catch {
        setError("Failed to load vendors.");
      } finally {
        if (!silent) setVendorsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        const data = (await res.json()) as AdminSessionResponse;
        if (!res.ok || !data.authenticated || data.role !== "admin") {
          router.replace(`/${adminKey}/login`);
          return;
        }
        setAdminId(data.adminId ?? "admin");
      } catch {
        router.replace(`/${adminKey}/login`);
      } finally {
        setLoading(false);
      }
    };
    void check();
  }, [router, adminKey]);

  useEffect(() => {
    if (!loading && adminId) void loadVendors(filter);
  }, [loading, adminId, filter, loadVendors]);

  useEffect(() => {
    if (rejecting && rejectRef.current) rejectRef.current.focus();
  }, [rejecting]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace(`/${adminKey}/login`);
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAction = async (vendorId: string, action: "approve" | "reject") => {
    let reason: string | undefined;
    if (action === "reject") {
      reason = rejectReason.trim() || undefined;
      setRejecting(null);
      setRejectReason("");
    }
    setActionBusy(vendorId);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Action failed.");
        return;
      }
      await loadVendors(filter);
    } catch {
      setError("Action failed.");
    } finally {
      setActionBusy(null);
    }
  };

  const startReject = (vendorId: string) => {
    setRejecting(vendorId);
    setRejectReason("");
  };

  const cancelReject = () => {
    setRejecting(null);
    setRejectReason("");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <p className="text-sm text-muted">Checking admin session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row">
        <aside className="md:w-60 md:shrink-0">
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:sticky md:top-8">
            <div className="mb-4">
              <h1 className="text-lg font-semibold tracking-tight text-heading">
                Admin
              </h1>
              <p className="truncate text-xs text-muted">{adminId}</p>
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setSection("vendors")}
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  section === "vendors"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-surface-hover"
                }`}
              >
                Vendors
              </button>
              <button
                type="button"
                onClick={() => setSection("products")}
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  section === "products"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-surface-hover"
                }`}
              >
                Products
              </button>
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`mt-4 w-full ${outlineBtn}`}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {section === "products" ? (
            <AdminProducts />
          ) : (
            <section className={panel}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-heading">
                Vendor Approvals
              </h2>
              <button
                type="button"
                onClick={() => loadVendors(filter)}
                disabled={vendorsLoading}
                className="inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-surface-hover disabled:opacity-60"
                title="Refresh vendor list"
              >
                <span className={vendorsLoading ? "animate-spin" : ""}>↻</span>
                Refresh
              </button>
              {lastUpdated ? (
                <span className="text-xs text-muted">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                    filter === s ? buttonChipActive : buttonChipInactive
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="mb-4 rounded-md bg-error-bg px-3 py-2 text-sm text-error-fg">
              {error}
            </p>
          ) : null}

          {vendorsLoading ? (
            <p className="py-8 text-center text-sm text-muted">
              Loading vendors...
            </p>
          ) : vendors.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No vendors found for this filter.
            </p>
          ) : (
            <ul className="space-y-3">
              {vendors.map((v) => {
                const isOpen = expanded === v.vendorId;
                return (
                  <li
                    key={v.vendorId}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {v.profile.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.profile.logoUrl}
                            alt=""
                            className="h-10 w-10 rounded-full border border-border object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full border border-dashed border-input" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {v.profile.brandName || "(no brand name)"}
                          </p>
                          <p className="text-xs text-muted">{v.email}</p>
                        </div>
                      </div>
                      <span className={`${statusBadge.base} ${statusBadge[v.status]}`}>
                        {statusLabel(v.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : v.vendorId)}
                        className="text-xs font-medium text-muted underline"
                      >
                        {isOpen ? "Hide details" : "View details"}
                      </button>
                    </div>

                    {isOpen ? (
                      <div className="mt-3 space-y-3 rounded-lg bg-surface-hover p-4 text-sm">
                        <Detail label="About" value={v.profile.about} />
                        <Detail label="Brand story" value={v.profile.brandStory} />
                        <Detail label="GST" value={v.kyc.gstNumber} />
                        <Detail label="PAN" value={v.kyc.panNumber} />
                        <Detail
                          label="Bank"
                          value={
                            v.bankDetails.accountNumber
                              ? `${v.bankDetails.accountHolder} · ${v.bankDetails.bankName} · ${v.bankDetails.accountNumber} · ${v.bankDetails.ifsc}`
                              : ""
                          }
                        />
                        <Detail
                          label="Pickup"
                          value={[
                            v.pickupAddress.line1,
                            v.pickupAddress.line2,
                            v.pickupAddress.city,
                            v.pickupAddress.state,
                            v.pickupAddress.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        />
                        <Detail
                          label="Commission"
                          value={v.commission.accepted ? "Accepted" : "Not accepted"}
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            Documents ({v.kyc.documents.length})
                          </p>
                          {v.kyc.documents.length ? (
                            <ul className="mt-1 space-y-1">
                              {v.kyc.documents.map((d) => (
                                <li key={d.id}>
                                  <a
                                    href={d.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground underline"
                                  >
                                    {d.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted">None</p>
                          )}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-3 flex gap-2">
                      {v.status !== "approved" ? (
                        <button
                          type="button"
                          disabled={actionBusy === v.vendorId}
                          onClick={() => handleAction(v.vendorId, "approve")}
                          className={buttonApprove}
                        >
                          Approve
                        </button>
                      ) : null}
                      {v.status !== "rejected" ? (
                        <button
                          type="button"
                          disabled={actionBusy === v.vendorId}
                          onClick={() => startReject(v.vendorId)}
                          className={buttonReject}
                        >
                          Reject
                        </button>
                      ) : null}
                    </div>

                    {rejecting === v.vendorId ? (
                      <div className="mt-3 space-y-2 rounded-lg border border-error-fg/40 bg-error-bg/10 p-3">
                        <label className="block text-xs font-medium text-foreground">
                          Reason for rejection (will be emailed to vendor)
                        </label>
                        <textarea
                          ref={rejectRef}
                          className={input + " min-h-20"}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Provide feedback so the vendor can fix and resubmit…"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={actionBusy === v.vendorId}
                            onClick={() => handleAction(v.vendorId, "reject")}
                            className={buttonReject}
                          >
                            {actionBusy === v.vendorId
                              ? "Rejecting…"
                              : "Confirm Rejection"}
                          </button>
                          <button
                            type="button"
                            disabled={actionBusy === v.vendorId}
                            onClick={cancelReject}
                            className={outlineBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
          )}
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="font-medium text-foreground">{label}:</span>{" "}
      <span className="text-muted">{value}</span>
    </div>
  );
}
