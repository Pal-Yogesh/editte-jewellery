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
import { PLACEMENTS, formatPlacement } from "@/lib/product/categories";

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
  /** Rails the vendor asked for. */
  requestedPlacements: string[];
  /** Rails an admin granted — this is what the storefront shows. */
  placements: string[];
  /** False hides an approved listing from the storefront without rejecting it. */
  visibleOnSite: boolean;
  media: ProductMedia[];
  vendor: { brandName: string; email: string };
};

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

/** "" = don't narrow by rail. */
type PlacementFilter = "" | string;

function money(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function AdminProducts() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [railFilter, setRailFilter] = useState<PlacementFilter>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (status: StatusFilter, rail: PlacementFilter) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (rail) params.set("placement", rail);
      const query = params.toString() ? `?${params}` : "";
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
    void load(filter, railFilter);
  }, [filter, railFilter, load]);

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
      await load(filter, railFilter);
    } catch {
      setError("Action failed.");
    } finally {
      setActionBusy(null);
    }
  };

  /**
   * Saves where an approved listing appears. Sends the whole placement set so
   * the server never has to merge, and refreshes so the rail counts stay honest.
   */
  const handleCurate = async (
    product: Product,
    patch: { placements?: string[]; visibleOnSite?: boolean }
  ) => {
    setActionBusy(product.productId);
    try {
      const res = await fetch(`/api/admin/products/${product.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "curate", ...patch }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Could not save display settings.");
        return;
      }
      await load(filter, railFilter);
    } catch {
      setError("Could not save display settings.");
    } finally {
      setActionBusy(null);
    }
  };

  /** How many loaded products sit on each rail — the "only 2–3" check. */
  const isLive = (p: Product, railId: string) =>
    p.status === "approved" && p.visibleOnSite && p.placements.includes(railId);

  const railCounts = PLACEMENTS.map((pl) => ({
    ...pl,
    rails: pl.rails.map((rail) => ({
      ...rail,
      live: products.filter((p) => isLive(p, rail.id)).length,
      requested: products.filter((p) => p.requestedPlacements.includes(rail.id))
        .length,
    })),
  }));

  return (
    <section className={panel}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className={subheading}>Product Approvals</h2>
          <button
            type="button"
            onClick={() => load(filter, railFilter)}
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

      {/* Rail queues — "who asked for Sale, and who is actually on it". */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border p-3">
        <span className="mr-1 text-xs uppercase tracking-[0.15em] text-heading">
          Collection
        </span>
        <button
          type="button"
          onClick={() => setRailFilter("")}
          className={`${chipBase} ${
            railFilter === "" ? buttonChipActive : buttonChipInactive
          }`}
        >
          All products
        </button>
        {railCounts.map((pl) => (
          <button
            key={pl.id}
            type="button"
            onClick={() => setRailFilter(railFilter === pl.id ? "" : pl.id)}
            className={`${chipBase} ${
              railFilter === pl.id ? buttonChipActive : buttonChipInactive
            }`}
          >
            {pl.label}
          </button>
        ))}

        {railFilter ? (
          <div className="mt-1 w-full">
            <p className="text-xs text-muted">
              Everyone who asked for this collection. Turn on the ones you want
              on the site.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {railCounts
                .find((pl) => pl.id === railFilter)
                ?.rails.map((rail) => (
                  <span key={rail.id} className="text-xs text-muted">
                    <span className="text-heading">{rail.label}</span>{" "}
                    {rail.live} live of {rail.requested}
                  </span>
                ))}
            </div>
          </div>
        ) : null}
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
                  <div className="flex flex-col items-end gap-1">
                    <span className={`${statusBadge.base} ${statusBadge[p.status]}`}>
                      {p.status}
                    </span>
                    {p.status === "approved" && !p.visibleOnSite ? (
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted">
                        Hidden
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Where this listing appears. Only meaningful once approved. */}
                {p.status === "approved" ? (
                  <DisplayControls
                    product={p}
                    busy={actionBusy === p.productId}
                    onCurate={handleCurate}
                  />
                ) : p.requestedPlacements.length > 0 ? (
                  <p className="mt-3 text-xs text-muted">
                    Requested collections:{" "}
                    {p.requestedPlacements.map(formatPlacement).join(", ")} —
                    approve the product to decide.
                  </p>
                ) : null}

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

/**
 * The curation row: one switch for "on the site at all", then one per rail,
 * grouped by placement so it reads like the navbar. A rail the vendor asked for
 * is marked, so a full rail can be filled from the requests rather than at
 * random — ten vendors ask, two or three get the slot.
 */
function DisplayControls({
  product,
  busy,
  onCurate,
}: {
  product: Product;
  busy: boolean;
  onCurate: (
    product: Product,
    patch: { placements?: string[]; visibleOnSite?: boolean }
  ) => void;
}) {
  const toggleRail = (id: string) => {
    const next = product.placements.includes(id)
      ? product.placements.filter((p) => p !== id)
      : [...product.placements, id];
    onCurate(product, { placements: next });
  };

  return (
    <div className="mt-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-xs uppercase tracking-[0.15em] text-heading">
          Show on website
        </span>
        <Switch
          label={product.visibleOnSite ? "Live on site" : "Hidden"}
          checked={product.visibleOnSite}
          disabled={busy}
          onChange={() =>
            onCurate(product, { visibleOnSite: !product.visibleOnSite })
          }
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {PLACEMENTS.map((placement) => (
          <div key={placement.id}>
            <p className="text-xs uppercase tracking-[0.15em] text-muted">
              {placement.label} · {placement.groupLabel}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
              {placement.rails.map((rail) => (
                <Switch
                  key={rail.id}
                  label={rail.label}
                  note={
                    product.requestedPlacements.includes(rail.id)
                      ? "requested"
                      : undefined
                  }
                  checked={product.placements.includes(rail.id)}
                  disabled={busy || !product.visibleOnSite}
                  onChange={() => toggleRail(rail.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!product.visibleOnSite ? (
        <p className="mt-2 text-xs text-muted">
          Hidden listings appear on no collection. Turn it live to place it.
        </p>
      ) : null}
    </div>
  );
}

function Switch({
  label,
  note,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  note?: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-2 text-sm ${
        disabled ? "opacity-50" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        className="h-4 w-4 accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className={checked ? "text-heading" : "text-muted"}>{label}</span>
      {note ? (
        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-muted">
          {note}
        </span>
      ) : null}
    </label>
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
