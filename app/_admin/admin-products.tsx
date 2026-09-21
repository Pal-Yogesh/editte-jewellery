"use client";

import { useCallback, useEffect, useState } from "react";
import {
  bannerError,
  buttonApprove,
  buttonChipActive,
  buttonChipInactive,
  buttonQuiet,
  buttonReject,
  chipBase,
  linkMuted,
  panel,
  statusBadge,
  subheading,
} from "@/app/theme";

type ProductMedia = {
  id: string;
  kind: "image" | "video";
  contentType: string;
  url: string;
};

type Product = {
  productId: string;
  title: string;
  description: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  metal: string;
  colors: string[];
  size: string;
  weightGrams: number;
  category: string;
  brandName: string;
  quantity: number;
  sku: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  media: ProductMedia[];
  vendor: { brandName: string; email: string };
};

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function money(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function AdminProducts() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    setError("");
    try {
      const query = status === "all" ? "" : `?status=${status}`;
      const res = await fetch(`/api/admin/products${query}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load products.");
        return;
      }
      setProducts(data.products as Product[]);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const handleAction = async (productId: string, action: "approve" | "reject") => {
    let reason: string | undefined;
    if (action === "reject") {
      reason = prompt("Reason for rejection (optional):") ?? undefined;
    }
    setActionBusy(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Action failed.");
        return;
      }
      await load(filter);
    } catch {
      setError("Action failed.");
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <section className={panel}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className={subheading}>Product Approvals</h2>
          <button
            type="button"
            onClick={() => load(filter)}
            disabled={loading}
            className={`gap-1.5 ${buttonQuiet}`}
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`${chipBase} ${
                filter === s ? buttonChipActive : buttonChipInactive
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className={`mb-4 ${bannerError}`}>
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No products found for this filter.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => {
            const thumb = p.media.find((m) => m.kind === "image");
            const isOpen = expanded === p.productId;
            return (
              <li
                key={p.productId}
                className="rounded-xl border border-border p-5 transition-colors hover:border-heading/20"
              >
                <div className="flex items-center gap-4">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb.url}
                      alt=""
                      className="h-14 w-14 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg border border-dashed border-input" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-base text-heading">
                      {p.title || "(untitled)"}
                    </p>
                    <p className="text-xs text-muted">
                      by{" "}
                      <span className="font-medium text-foreground">
                        {p.vendor.brandName || p.brandName || "Unknown vendor"}
                      </span>
                      {p.vendor.email ? ` · ${p.vendor.email}` : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {money(p.finalPrice)}
                      {p.discountPercent > 0 ? (
                        <span className="ml-1 line-through">{money(p.price)}</span>
                      ) : null}
                      {" · "}Qty {p.quantity}
                      {p.sku ? ` · ${p.sku}` : ""}
                    </p>
                  </div>
                  <span className={`${statusBadge.base} ${statusBadge[p.status]}`}>
                    {p.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : p.productId)}
                    className={`text-[10px] uppercase tracking-[0.15em] ${linkMuted}`}
                  >
                    {isOpen ? "Hide details" : "View details"}
                  </button>
                  <div className="ml-auto flex gap-2">
                    {p.status !== "approved" ? (
                      <button
                        type="button"
                        disabled={actionBusy === p.productId}
                        onClick={() => handleAction(p.productId, "approve")}
                        className={buttonApprove}
                      >
                        Approve
                      </button>
                    ) : null}
                    {p.status !== "rejected" ? (
                      <button
                        type="button"
                        disabled={actionBusy === p.productId}
                        onClick={() => handleAction(p.productId, "reject")}
                        className={buttonReject}
                      >
                        Reject
                      </button>
                    ) : null}
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-4 space-y-2 rounded-lg bg-surface-hover p-4 text-sm">
                    {p.description ? (
                      <p className="text-muted">{p.description}</p>
                    ) : null}
                    <Detail label="Category" value={p.category} />
                    <Detail label="Metal" value={p.metal} />
                    <Detail label="Colors" value={p.colors.join(", ")} />
                    <Detail label="Size" value={p.size} />
                    <Detail
                      label="Weight"
                      value={p.weightGrams ? `${p.weightGrams} g` : ""}
                    />
                    <Detail label="SKU" value={p.sku} />
                    {p.media.length ? (
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-heading">Media</p>
                        <ul className="mt-1 flex flex-wrap gap-3">
                          {p.media.map((m) => (
                            <li key={m.id}>
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkMuted}
                              >
                                {m.kind}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs uppercase tracking-[0.15em] text-heading">
        {label}:
      </span>{" "}
      <span className="text-muted">{value}</span>
    </div>
  );
}
