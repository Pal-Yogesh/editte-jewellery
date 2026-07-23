"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ImageDropZone,
  QuickAddStrip,
  VideoDropZone,
} from "./media-drop-zone";
import {
  banner as bannerClass,
  buttonDanger,
  buttonOutline,
  buttonPrimary,
  input,
  label as labelClass,
  muted,
  statusBadge,
  subheading,
  textarea,
} from "@/app/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductMedia = {
  id: string;
  kind: "image" | "video";
  contentType: string;
  url: string;
};

type Product = {
  productId: string;
  title: string;
  finalPrice: number;
  price: number;
  discountPercent: number;
  quantity: number;
  sku: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  media: ProductMedia[];
};

type SubmitState = "idle" | "uploading" | "done" | { error: string };

type Draft = {
  key: string;
  title: string;
  description: string;
  price: string;
  discountPercent: string;
  metal: string;
  colors: string;
  size: string;
  category: string;
  brandName: string;
  quantity: string;
  minQuantity: string;
  sku: string;
  images: File[];
  video: File | null;
  submitState: SubmitState;
};

type ParsedRow = {
  rowNumber: number;
  title: string;
  description: string;
  price: number;
  discountPercent: number;
  metal: string;
  colors: string[];
  size: string;
  category: string;
  brandName: string;
  quantity: number;
  minQuantity: number;
  sku: string;
};

type ParseError = { row: number; message: string };

type ImportSummary = {
  rows: ParsedRow[];
  errors: ParseError[];
  total: number;
};

let draftCounter = 0;
function makeDraft(defaults: Partial<Draft> = {}): Draft {
  draftCounter += 1;
  return {
    key: `draft-${draftCounter}`,
    title: "",
    description: "",
    price: "",
    discountPercent: "",
    metal: "",
    colors: "",
    size: "",
    category: "",
    brandName: "",
    quantity: "",
    minQuantity: "",
    sku: "",
    images: [],
    video: null,
    submitState: "idle",
    ...defaults,
  };
}

function rowToDraft(row: ParsedRow): Draft {
  return makeDraft({
    title: row.title,
    description: row.description,
    price: String(row.price),
    discountPercent: String(row.discountPercent || ""),
    metal: row.metal,
    colors: row.colors.join(", "),
    size: row.size,
    category: row.category,
    brandName: row.brandName,
    quantity: String(row.quantity || ""),
    minQuantity: String(row.minQuantity || ""),
    sku: row.sku,
  });
}

function money(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function calcFinal(price: string, disc: string) {
  const p = Number(price) || 0;
  const d = Math.min(Math.max(Number(disc) || 0, 0), 100);
  return Math.round((p - (p * d) / 100) * 100) / 100;
}

/** Returns the missing mandatory fields for a draft (empty array = ready to submit). */
function missingFields(d: Draft): string[] {
  const missing: string[] = [];
  if (!d.title.trim())    missing.push("title");
  if (!d.sku.trim())      missing.push("SKU");
  if (!Number(d.price) || Number(d.price) <= 0) missing.push("price");
  if (d.images.length === 0) missing.push("at least one image");
  return missing;
}

/** A draft can be submitted only if it has no missing mandatory fields. */
function isReady(d: Draft): boolean {
  return missingFields(d).length === 0;
}

// ─── DraftCard ────────────────────────────────────────────────────────────────

type DraftCardProps = {
  draft: Draft;
  index: number;
  previews: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Draft>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  submitting: boolean;
};

function DraftCard({
  draft,
  index,
  previews,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
  onDuplicate,
  submitting,
}: DraftCardProps) {
  const { submitState } = draft;
  const isUploading = submitState === "uploading";
  const isDone      = submitState === "done";
  const isFailed    = typeof submitState === "object";
  const missing     = missingFields(draft);

  const stateLabel = isUploading ? (
    <span className="flex items-center gap-1 text-xs text-warning-fg">
      <span className="inline-block animate-spin">⟳</span> Uploading…
    </span>
  ) : isDone ? (
    <span className="text-xs text-success-fg">✓ Submitted</span>
  ) : isFailed ? (
    <span className="text-xs text-error-fg">
      ✗ {(submitState as { error: string }).error.slice(0, 50)}
    </span>
  ) : null;

  const noImages = draft.images.length === 0 && !isDone && !isUploading;

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isDone
          ? "border-success-bg bg-success-bg/30 opacity-60"
          : isFailed
          ? "border-error-fg/40"
          : isExpanded
          ? "border-primary/40"
          : "border-border"
      }`}
    >
      {/* Collapsed header */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex shrink-0 gap-1">
          {previews.slice(0, 3).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt=""
              className="h-10 w-10 rounded-md border border-border object-cover" />
          ))}
          {previews.length > 3 && (
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-surface-hover text-xs text-muted">
              +{previews.length - 3}
            </div>
          )}
          {previews.length === 0 && (
            <div className={`flex h-10 w-10 items-center justify-center rounded-md border border-dashed text-xs ${noImages ? "border-warning-fg text-warning-fg" : "border-input text-muted"}`}>
              🖼
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {draft.title || `Product ${index + 1}`}
          </p>
          <p className="text-xs text-muted">
            {draft.price ? money(calcFinal(draft.price, draft.discountPercent)) : "No price"}
            {draft.images.length > 0 ? ` · ${draft.images.length} img${draft.images.length > 1 ? "s" : ""}` : ""}
            {draft.video ? " · video" : ""}
          </p>
          {stateLabel}
          {!isUploading && !isDone && !isFailed && missing.length > 0 && (
            <span className="text-xs text-warning-fg">
              ⚠ Missing: {missing.join(", ")}
            </span>
          )}
        </div>

        {!isUploading && !isDone ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={onToggle}
              className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-surface-hover">
              {isExpanded ? "▲ Close" : "▼ Edit"}
            </button>
            <button type="button" onClick={onDuplicate} title="Duplicate"
              disabled={submitting}
              className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-surface-hover disabled:opacity-40">
              ⧉
            </button>
            <button type="button" onClick={onRemove}
              disabled={submitting && !isFailed}
              className="text-sm text-danger transition hover:opacity-70 disabled:opacity-40"
              title="Remove">
              ×
            </button>
          </div>
        ) : null}
      </div>

      {/* Expanded form */}
      {isExpanded ? (
        <div className="border-t border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Product title *</label>
              <input className={input} value={draft.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="e.g. 22K Gold Bangle Set" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea className={textarea} value={draft.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Materials, craftsmanship, occasion…" />
            </div>

            <div>
              <label className={labelClass}>Price / MRP (₹) *</label>
              <input type="number" min="0" className={input} value={draft.price}
                onChange={(e) => onUpdate({ price: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Discount (%)</label>
              <input type="number" min="0" max="100" className={input}
                value={draft.discountPercent}
                onChange={(e) => onUpdate({ discountPercent: e.target.value })} />
            </div>
            {draft.price ? (
              <div className="sm:col-span-2 rounded-md bg-surface-hover px-3 py-2 text-sm">
                Final price:{" "}
                <span className="font-semibold text-foreground">
                  {money(calcFinal(draft.price, draft.discountPercent))}
                </span>
                {Number(draft.discountPercent) > 0 && (
                  <span className="ml-2 line-through text-muted">{money(Number(draft.price))}</span>
                )}
              </div>
            ) : null}

            <div>
              <label className={labelClass}>Metal</label>
              <input className={input} value={draft.metal}
                onChange={(e) => onUpdate({ metal: e.target.value })}
                placeholder="e.g. 22K Gold, 925 Silver" />
            </div>
            <div>
              <label className={labelClass}>Colors</label>
              <input className={input} value={draft.colors}
                onChange={(e) => onUpdate({ colors: e.target.value })}
                placeholder="Gold, Rose Gold (comma-separated)" />
            </div>
            <div>
              <label className={labelClass}>Size</label>
              <input className={input} value={draft.size}
                onChange={(e) => onUpdate({ size: e.target.value })}
                placeholder="e.g. 6, 7, Free size" />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input className={input} value={draft.category}
                onChange={(e) => onUpdate({ category: e.target.value })}
                placeholder="e.g. Rings, Necklaces" />
            </div>
            <div>
              <label className={labelClass}>Brand name</label>
              <input className={input} value={draft.brandName}
                onChange={(e) => onUpdate({ brandName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input type="number" min="0" className={input} value={draft.quantity}
                onChange={(e) => onUpdate({ quantity: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Min Qty Alert</label>
              <input type="number" min="0" className={input} value={draft.minQuantity}
                onChange={(e) => onUpdate({ minQuantity: e.target.value })}
                placeholder="0 = no alert" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>SKU</label>
              <input className={input} value={draft.sku}
                onChange={(e) => onUpdate({ sku: e.target.value })} />
            </div>

            {/* Media — drag-drop zones */}
            <div className="sm:col-span-2">
              <ImageDropZone
                previews={previews}
                count={draft.images.length}
                onAdd={(files) => onUpdate({ images: [...draft.images, ...files] })}
                onRemove={(i) => onUpdate({ images: draft.images.filter((_, idx) => idx !== i) })}
              />
            </div>
            <div className="sm:col-span-2">
              <VideoDropZone
                videoName={draft.video?.name ?? null}
                onSet={(file) => onUpdate({ video: file })}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── ProductsPanel ────────────────────────────────────────────────────────────

export default function ProductsPanel({
  vendorStatus,
  brandName,
  onQueueChange,
}: {
  vendorStatus: "incomplete" | "pending" | "under_review" | "approved" | "rejected";
  brandName: string;
  onQueueChange?: (count: number) => void;
}) {
  const approved = vendorStatus === "approved";

  const [products, setProducts]         = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [drafts, setDrafts]             = useState<Draft[]>([]);
  const [previewsMap, setPreviewsMap]   = useState<Record<string, string[]>>({});
  const [expandedKey, setExpandedKey]   = useState<string | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [deleteBusy, setDeleteBusy]     = useState<string | null>(null);
  const [topMessage, setTopMessage]     = useState<{ text: string; error: boolean } | null>(null);

  // Excel import state
  const [importLoading, setImportLoading]   = useState(false);
  const [importSummary, setImportSummary]   = useState<ImportSummary | null>(null);
  const [importError, setImportError]       = useState<string | null>(null);

  // Report queue count to parent (for sidebar badge)
  useEffect(() => {
    const active = drafts.filter((d) => d.submitState !== "done").length;
    onQueueChange?.(active);
  }, [drafts, onQueueChange]);

  // Revoke preview URLs on change / unmount
  useEffect(() => {
    return () => {
      Object.values(previewsMap).flat().forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewsMap]);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/vendor/products", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setProducts(data.products as Product[]);
    } catch { /* ignore */ } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const updateDraft = useCallback((key: string, patch: Partial<Draft>) => {
    if (patch.images !== undefined) {
      const newUrls = patch.images.map((f) => URL.createObjectURL(f));
      setPreviewsMap((prev) => {
        (prev[key] ?? []).forEach((u) => URL.revokeObjectURL(u));
        return { ...prev, [key]: newUrls };
      });
    }
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }, []);

  const addDraft = (defaults: Partial<Draft> = {}) => {
    const draft = makeDraft({ brandName, ...defaults });
    setDrafts((prev) => [...prev, draft]);
    setExpandedKey(draft.key);
  };

  const removeDraft = (key: string) => {
    setPreviewsMap((prev) => {
      (prev[key] ?? []).forEach((u) => URL.revokeObjectURL(u));
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setDrafts((prev) => prev.filter((d) => d.key !== key));
    setExpandedKey((prev) => (prev === key ? null : prev));
  };

  const duplicateDraft = (draft: Draft) => {
    const newDraft = makeDraft({
      title: draft.title,
      description: draft.description,
      price: draft.price,
      discountPercent: draft.discountPercent,
      metal: draft.metal,
      colors: draft.colors,
      size: draft.size,
      category: draft.category,
      brandName: draft.brandName,
      quantity: draft.quantity,
      minQuantity: draft.minQuantity,
      sku: "",
    });
    setDrafts((prev) => [...prev, newDraft]);
    setExpandedKey(newDraft.key);
  };

  // ── Excel import ────────────────────────────────────────────────────────────
  const downloadTemplate = () => {
    window.location.href = "/api/vendor/products/template";
  };

  const handleExcelUpload = async (file: File) => {
    setImportLoading(true);
    setImportError(null);
    setImportSummary(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/vendor/products/parse-excel", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.message || "Failed to parse Excel file.");
        return;
      }
      setImportSummary(data as ImportSummary);
    } catch {
      setImportError("Upload failed. Please try again.");
    } finally {
      setImportLoading(false);
    }
  };

  const confirmImport = () => {
    if (!importSummary) return;
    const newDrafts = importSummary.rows.map(rowToDraft);
    setDrafts((prev) => [...prev, ...newDrafts]);
    setImportSummary(null);
    setImportError(null);
    setTopMessage({ text: `${newDrafts.length} product(s) added to queue. Now add images and videos for each.`, error: false });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submitOne = async (d: Draft): Promise<string | null> => {
    const form = new FormData();
    form.append("title", d.title);
    form.append("description", d.description);
    form.append("price", d.price);
    form.append("discountPercent", d.discountPercent || "0");
    form.append("metal", d.metal);
    form.append("colors", d.colors);
    form.append("size", d.size);
    form.append("category", d.category);
    form.append("brandName", d.brandName);
    form.append("quantity", d.quantity || "0");
    form.append("minQuantity", d.minQuantity || "0");
    form.append("sku", d.sku);
    d.images.forEach((img) => form.append("images", img));
    if (d.video) form.append("video", d.video);
    const res = await fetch("/api/vendor/products", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return (data.message as string) || "Upload failed";
    }
    return null;
  };

  const submitAll = async () => {
    // Only submit drafts that have all mandatory fields filled.
    const toSubmit = drafts.filter(
      (d) =>
        (d.submitState === "idle" || typeof d.submitState === "object") &&
        isReady(d)
    );
    if (toSubmit.length === 0) return;
    setSubmitting(true);
    setTopMessage(null);
    setExpandedKey(null);
    let succeeded = 0, failed = 0;
    for (const d of toSubmit) {
      setDrafts((prev) => prev.map((x) => x.key === d.key ? { ...x, submitState: "uploading" } : x));
      const err = await submitOne(d);
      if (err) {
        setDrafts((prev) => prev.map((x) => x.key === d.key ? { ...x, submitState: { error: err } } : x));
        failed++;
      } else {
        setDrafts((prev) => prev.map((x) => x.key === d.key ? { ...x, submitState: "done" } : x));
        succeeded++;
      }
    }
    await new Promise<void>((r) => setTimeout(r, 1200));
    setDrafts((prev) => prev.filter((d) => d.submitState !== "done"));
    await loadProducts();
    setTopMessage(
      failed === 0
        ? { text: `${succeeded} product(s) submitted for approval.`, error: false }
        : { text: `${succeeded} submitted. ${failed} failed — correct and resubmit.`, error: true }
    );
    setSubmitting(false);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Delete this product?")) return;
    setDeleteBusy(productId);
    try {
      const res = await fetch(`/api/vendor/products/${productId}`, { method: "DELETE" });
      if (res.ok) await loadProducts();
      else setTopMessage({ text: "Failed to delete product.", error: true });
    } finally { setDeleteBusy(null); }
  };

  // ── Not approved ────────────────────────────────────────────────────────────
  if (!approved) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className={subheading}>Products</h2>
        <p className={`mt-2 ${muted}`}>
          Products unlock once your account is approved. Complete your profile in{" "}
          <strong>Account &amp; Details</strong> and submit for admin review.
        </p>
      </div>
    );
  }

  const readyCount = drafts.filter(
    (d) =>
      (d.submitState === "idle" || typeof d.submitState === "object") &&
      isReady(d)
  ).length;
  const notReadyCount = drafts.filter(
    (d) =>
      (d.submitState === "idle" || typeof d.submitState === "object") &&
      !isReady(d)
  ).length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {topMessage && (
        <p className={bannerClass(topMessage.error)}>{topMessage.text}</p>
      )}

      {/* Upload queue */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {/* Header actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={subheading}>Upload queue</h2>
            {drafts.length > 0 && (
              <p className={`mt-0.5 ${muted}`}>
                {drafts.length} product{drafts.length > 1 ? "s" : ""} · keep this tab open while uploading
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Excel import */}
            <button type="button" onClick={downloadTemplate} className={buttonOutline}>
              ⬇ Template
            </button>
            <label className={buttonOutline + " cursor-pointer"}>
              {importLoading ? "Parsing…" : "↑ Import Excel"}
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleExcelUpload(f);
                  e.target.value = "";
                }}
              />
            </label>
            {/* Manual add */}
            <button type="button" onClick={() => addDraft()} disabled={submitting} className={buttonOutline}>
              + Add product
            </button>
            {readyCount > 0 ? (
              <button type="button" onClick={submitAll} disabled={submitting} className={buttonPrimary}>
                {submitting ? "Uploading…" : `Submit ${readyCount}`}
              </button>
            ) : notReadyCount > 0 ? (
              <button type="button" disabled title="Complete all required fields first" className={buttonPrimary + " opacity-50 cursor-not-allowed"}>
                Submit (incomplete)
              </button>
            ) : null}
          </div>
        </div>

        {/* Excel import error */}
        {importError && (
          <p className="mb-4 rounded-md bg-error-bg px-3 py-2 text-sm text-error-fg">{importError}</p>
        )}

        {/* Not-ready warning */}
        {notReadyCount > 0 && (
          <p className="mb-4 rounded-md bg-warning-bg px-3 py-2 text-sm text-warning-fg">
            {notReadyCount} product{notReadyCount > 1 ? "s" : ""} can&apos;t be submitted yet — each needs a title, SKU, price, and at least one image.
          </p>
        )}

        {/* Import summary panel */}
        {importSummary && (
          <div className="mb-4 rounded-xl border border-border bg-surface-hover p-4">
            <p className="font-medium text-foreground">
              Excel parsed: {importSummary.total} rows found
            </p>
            <p className={`mt-1 ${muted}`}>
              ✅ {importSummary.rows.length} ready to add
              {importSummary.errors.length > 0 ? ` · ❌ ${importSummary.errors.length} errors` : ""}
            </p>
            {importSummary.errors.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {importSummary.errors.map((e) => (
                  <li key={e.row} className="text-xs text-error-fg">
                    Row {e.row} — {e.message}
                  </li>
                ))}
              </ul>
            )}
            {importSummary.rows.length > 0 ? (
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={confirmImport} className={buttonPrimary}>
                  Add {importSummary.rows.length} product{importSummary.rows.length > 1 ? "s" : ""} to queue
                </button>
                <button type="button" onClick={() => setImportSummary(null)} className={buttonOutline}>
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setImportSummary(null)} className={`mt-3 ${buttonOutline}`}>
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Quick-add strip */}
        <div className="mb-4">
          <QuickAddStrip
            defaultBrand={brandName}
            onAdd={(title, sku, price, brand) =>
              addDraft({ title, sku, price, brandName: brand })
            }
          />
        </div>

        {/* Draft cards */}
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-input py-10 text-center">
            <p className="text-sm font-medium text-foreground">Queue is empty</p>
            <p className={`mt-1 ${muted}`}>
              Import an Excel file, use the quick-add strip above, or click{" "}
              <strong>+ Add product</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {drafts.map((d, i) => (
              <DraftCard
                key={d.key}
                draft={d}
                index={i}
                previews={previewsMap[d.key] ?? []}
                isExpanded={expandedKey === d.key}
                onToggle={() => setExpandedKey((prev) => (prev === d.key ? null : d.key))}
                onUpdate={(patch) => updateDraft(d.key, patch)}
                onRemove={() => removeDraft(d.key)}
                onDuplicate={() => duplicateDraft(d)}
                submitting={submitting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Existing products */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className={`mb-4 ${subheading}`}>Your products</h2>
        {loadingProducts ? (
          <p className={muted}>Loading…</p>
        ) : products.length === 0 ? (
          <p className={muted}>No products yet. Build your queue above and submit.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((p) => {
              const thumb = p.media.find((m) => m.kind === "image");
              return (
                <li key={p.productId}
                  className="flex items-center gap-4 rounded-xl border border-border p-3">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb.url} alt=""
                      className="h-12 w-12 rounded-md border border-border object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-input text-xs text-muted">🖼</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {p.title || "(untitled)"}
                    </p>
                    <p className="text-xs text-muted">
                      {money(p.finalPrice)}
                      {p.discountPercent > 0 && (
                        <span className="ml-1 line-through text-muted">{money(p.price)}</span>
                      )}
                      {" · "}Qty {p.quantity}
                      {p.sku ? ` · ${p.sku}` : ""}
                    </p>
                    {p.status === "rejected" && p.rejectionReason && (
                      <p className="mt-0.5 text-xs text-error-fg">Rejected: {p.rejectionReason}</p>
                    )}
                  </div>
                  <span className={`${statusBadge.base} ${statusBadge[p.status]}`}>{p.status}</span>
                  <button type="button"
                    disabled={deleteBusy === p.productId}
                    onClick={() => handleDelete(p.productId)}
                    className={`${buttonDanger} px-3 py-1.5 text-xs disabled:opacity-60`}>
                    {deleteBusy === p.productId ? "…" : "Delete"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
