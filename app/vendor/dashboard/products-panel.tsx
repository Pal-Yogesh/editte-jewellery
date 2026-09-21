"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ImageDropZone,
  QuickAddStrip,
  VideoDropZone,
} from "./media-drop-zone";
import {
  banner as bannerClass,
  bannerError,
  bannerWarning,
  buttonOutline,
  buttonPrimary,
  buttonQuiet,
  buttonReject,
  input,
  label as labelClass,
  muted,
  fieldError,
  fieldHint,
  inputInvalid,
  sectionLabel,
  select,
  selectInvalid,
  statusBadge,
  subheading,
  textarea,
} from "@/app/theme";
import {
  DEPARTMENTS,
  getDepartment,
  getGroup,
} from "@/lib/product/categories";

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
  weightGrams: number;
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
  weightGrams: string;
  department: string;
  categoryGroup: string;
  productType: string;
  brandName: string;
  quantity: string;
  minQuantity: string;
  sku: string;
  images: File[];
  video: File | null;
  submitState: SubmitState;
  /** Set once a submit was attempted while incomplete — turns on inline errors. */
  showErrors: boolean;
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
  weightGrams: number;
  department: string;
  categoryGroup: string;
  productType: string;
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
    weightGrams: "",
    department: "",
    categoryGroup: "",
    productType: "",
    brandName: "",
    quantity: "",
    minQuantity: "",
    sku: "",
    images: [],
    video: null,
    submitState: "idle",
    showErrors: false,
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
    weightGrams: row.weightGrams ? String(row.weightGrams) : "",
    department: row.department,
    categoryGroup: row.categoryGroup,
    productType: row.productType,
    brandName: row.brandName,
    quantity: String(row.quantity || ""),
    minQuantity: String(row.minQuantity || ""),
    sku: row.sku,
  });
}

/** Splits the comma-separated colour input into trimmed, non-empty values. */
function parseColors(raw: string): string[] {
  return raw.split(",").map((c) => c.trim()).filter(Boolean);
}

function money(n: number) {
  // Whole rupees stay clean; anything with paise shows both digits so a
  // discounted price never renders as "₹19,999.2".
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function calcFinal(price: string, disc: string) {
  const p = Number(price) || 0;
  const d = Math.min(Math.max(Number(disc) || 0, 0), 100);
  return Math.round((p - (p * d) / 100) * 100) / 100;
}

/** The mandatory fields, keyed so an error can be shown on the field itself. */
type RequiredField =
  | "title"
  | "department"
  | "categoryGroup"
  | "productType"
  | "price"
  | "weightGrams"
  | "sku"
  | "images";

/** Short names used in the "still needed" summary on the collapsed card. */
const FIELD_LABELS: Record<RequiredField, string> = {
  title: "Title",
  department: "Category",
  categoryGroup: "Sub-category",
  productType: "Product type",
  price: "Price",
  weightGrams: "Weight",
  sku: "SKU",
  images: "Image",
};

const REQUIRED_TOTAL = Object.keys(FIELD_LABELS).length;

/**
 * Per-field validation messages. An empty object means the draft is ready.
 * `duplicateSku` is passed in by the queue, which is the only place that can
 * see the other drafts.
 */
function fieldErrors(
  d: Draft,
  duplicateSku = false
): Partial<Record<RequiredField, string>> {
  const e: Partial<Record<RequiredField, string>> = {};
  if (!d.title.trim()) e.title = "Give the product a title.";
  if (!d.department) e.department = "Choose a category.";
  if (!d.categoryGroup) e.categoryGroup = "Choose a sub-category.";
  if (!d.productType) e.productType = "Choose a product type.";
  if (!Number(d.price) || Number(d.price) <= 0)
    e.price = "Enter a price greater than ₹0.";
  if (!Number(d.weightGrams) || Number(d.weightGrams) <= 0)
    e.weightGrams = "Enter the weight in grams.";
  if (!d.sku.trim()) e.sku = "Enter a SKU.";
  else if (duplicateSku) e.sku = "Another product in this queue uses this SKU.";
  if (d.images.length === 0) e.images = "Add at least one image.";
  return e;
}

function missingFields(d: Draft, duplicateSku = false): string[] {
  return (Object.keys(fieldErrors(d, duplicateSku)) as RequiredField[]).map(
    (k) => FIELD_LABELS[k]
  );
}

/** A draft can be submitted only if it has no missing mandatory fields. */
function isReady(d: Draft, duplicateSku = false): boolean {
  return Object.keys(fieldErrors(d, duplicateSku)).length === 0;
}

/** SKUs appearing more than once in the queue — these block submission. */
function duplicateSkus(drafts: Draft[]): Set<string> {
  const counts = new Map<string, number>();
  for (const d of drafts) {
    const key = d.sku.trim().toLowerCase();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, n]) => n > 1).map(([k]) => k));
}

/** Suggests a SKU from the brand and product type, e.g. "AUR-CHAINS-4821". */
function suggestSku(d: Draft): string {
  const slug = (v: string, len: number) =>
    v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, len);
  const brand = slug(d.brandName, 3) || "EDT";
  const type = slug(d.productType, 6) || "ITEM";
  return `${brand}-${type}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Common metals, offered as suggestions while still allowing free text. */
const METAL_SUGGESTIONS = [
  "22K Gold",
  "18K Gold",
  "14K Gold",
  "Rose Gold",
  "925 Sterling Silver",
  "Oxidised Silver",
  "Platinum",
  "Brass",
  "Stainless Steel",
];

// ─── Form primitives ──────────────────────────────────────────────────────────

/** A labelled field with an optional hint, and an error that replaces the hint. */
function Field({
  label,
  required,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>
        {label}
        {required ? <span className="text-rose"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className={fieldError}>{error}</p>
      ) : hint ? (
        <p className={fieldHint}>{hint}</p>
      ) : null}
    </div>
  );
}

/** Divider introducing a group of related fields. */
function Section({ title, note }: { title: string; note?: string }) {
  return (
    <div className="sm:col-span-2 mt-3 flex items-center gap-3 first:mt-0">
      <span className={sectionLabel}>{title}</span>
      {note ? <span className="text-xs text-muted">{note}</span> : null}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

// ─── CategorySelect ───────────────────────────────────────────────────────────

/**
 * Three dependent dropdowns: Category → Sub-category → Product type.
 * Narrowing a level clears everything below it, so a draft can never hold a
 * mismatched path like Men / Bags.
 */
function CategorySelect({
  draft,
  onUpdate,
  errors,
  showErrors,
}: {
  draft: Draft;
  onUpdate: (patch: Partial<Draft>) => void;
  errors: Partial<Record<RequiredField, string>>;
  showErrors: boolean;
}) {
  const department = getDepartment(draft.department);
  const group = getGroup(draft.department, draft.categoryGroup);
  const err = (k: RequiredField) => (showErrors ? errors[k] : undefined);
  const cls = (k: RequiredField) => (err(k) ? selectInvalid : select);

  return (
    <div className="sm:col-span-2 grid gap-x-5 gap-y-6 sm:grid-cols-3">
      <Field label="Category" required error={err("department")}>
        <select
          className={cls("department")}
          value={draft.department}
          onChange={(e) =>
            onUpdate({
              department: e.target.value,
              categoryGroup: "",
              productType: "",
            })
          }
        >
          <option value="">Select category</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sub-category" required error={err("categoryGroup")}>
        <select
          className={cls("categoryGroup")}
          value={draft.categoryGroup}
          disabled={!department}
          onChange={(e) =>
            onUpdate({ categoryGroup: e.target.value, productType: "" })
          }
        >
          <option value="">
            {department ? "Select sub-category" : "Pick a category first"}
          </option>
          {department?.groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Product type" required error={err("productType")}>
        <select
          className={cls("productType")}
          value={draft.productType}
          disabled={!group}
          onChange={(e) => onUpdate({ productType: e.target.value })}
        >
          <option value="">
            {group ? "Select product type" : "Pick a sub-category first"}
          </option>
          {group?.types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
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
  /** True when another draft in the queue already uses this SKU. */
  duplicateSku: boolean;
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
  duplicateSku,
}: DraftCardProps) {
  const { submitState } = draft;
  const isUploading = submitState === "uploading";
  const isDone      = submitState === "done";
  const isFailed    = typeof submitState === "object";
  const errors      = fieldErrors(draft, duplicateSku);
  const missing     = missingFields(draft, duplicateSku);
  const done        = REQUIRED_TOTAL - missing.length;
  const showErrors  = draft.showErrors;
  const err = (k: RequiredField) => (showErrors ? errors[k] : undefined);
  const cls = (k: RequiredField) => (err(k) ? inputInvalid : input);

  const stateLabel = isUploading ? (
    <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-warning-fg">
      <span className="inline-block animate-spin">⟳</span> Uploading…
    </span>
  ) : isDone ? (
    <span className="text-[10px] uppercase tracking-[0.12em] text-success-fg">✓ Submitted</span>
  ) : isFailed ? (
    <span className="text-[10px] uppercase tracking-[0.12em] text-error-fg">
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
              className="h-10 w-10 rounded-lg border border-border object-cover" />
          ))}
          {previews.length > 3 && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-hover text-xs text-muted">
              +{previews.length - 3}
            </div>
          )}
          {previews.length === 0 && (
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border border-dashed text-xs ${noImages ? "border-warning-fg text-warning-fg" : "border-input text-muted"}`}>
              🖼
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base text-heading">
            {draft.title || `Product ${index + 1}`}
          </p>
          <p className="text-xs text-muted">
            {draft.price ? money(calcFinal(draft.price, draft.discountPercent)) : "No price"}
            {draft.images.length > 0 ? ` · ${draft.images.length} img${draft.images.length > 1 ? "s" : ""}` : ""}
            {draft.video ? " · video" : ""}
          </p>
          {stateLabel}
          {!isUploading && !isDone && !isFailed && (
            missing.length > 0 ? (
              <button
                type="button"
                onClick={onToggle}
                className="mt-1 flex w-full items-center gap-2 text-left"
                title="Open this product and fill the remaining fields"
              >
                <span className="h-1 w-16 shrink-0 overflow-hidden rounded-full bg-border">
                  <span
                    className="block h-full rounded-full bg-warning-fg transition-all"
                    style={{ width: `${(done / REQUIRED_TOTAL) * 100}%` }}
                  />
                </span>
                <span className="truncate text-[10px] uppercase tracking-[0.12em] text-warning-fg">
                  {done}/{REQUIRED_TOTAL} · needs {missing.join(", ")}
                </span>
              </button>
            ) : (
              <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-success-fg">
                ✓ Ready to submit
              </span>
            )
          )}
        </div>

        {!isUploading && !isDone ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={onToggle}
              className={buttonQuiet}>
              {isExpanded ? "▲ Close" : "▼ Edit"}
            </button>
            <button type="button" onClick={onDuplicate} title="Duplicate"
              disabled={submitting}
              className={buttonQuiet}>
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
        <div className="border-t border-border bg-surface-hover/40 p-5 sm:p-6">
          <p className="mb-6 text-xs text-muted">
            Fields marked <span className="text-rose">*</span> are required before
            this product can be submitted for approval.
          </p>

          <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
            <Section title="The basics" />

            <Field
              label="Product title"
              required
              className="sm:col-span-2"
              error={err("title")}
              hint="Shoppers see this first — describe the piece in a few words."
            >
              <input className={cls("title")} value={draft.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="e.g. 22K Gold Bangle Set" />
            </Field>

            {/* Category — department → group → type, mirroring the storefront nav. */}
            <CategorySelect
              draft={draft}
              onUpdate={onUpdate}
              errors={errors}
              showErrors={showErrors}
            />

            <Field
              label="Description"
              className="sm:col-span-2"
              hint="Optional, but listings with a description convert better."
            >
              <textarea className={textarea} value={draft.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Materials, craftsmanship, occasion…" />
            </Field>

            <Section title="Price" />

            <Field label="Price / MRP (₹)" required error={err("price")}
              hint="The full price before any discount.">
              <input type="number" min="0" className={cls("price")} value={draft.price}
                onChange={(e) => onUpdate({ price: e.target.value })}
                placeholder="e.g. 24999" />
            </Field>
            <Field label="Discount (%)" hint="Leave blank if the item is not on offer.">
              <input type="number" min="0" max="100" className={input}
                value={draft.discountPercent}
                onChange={(e) => onUpdate({ discountPercent: e.target.value })}
                placeholder="0" />
            </Field>
            {draft.price ? (
              <div className="sm:col-span-2 rounded-lg bg-surface-hover px-4 py-2.5 text-sm">
                Shoppers pay{" "}
                <span className="font-heading text-base text-heading">
                  {money(calcFinal(draft.price, draft.discountPercent))}
                </span>
                {Number(draft.discountPercent) > 0 && (
                  <>
                    <span className="ml-2 line-through text-muted">{money(Number(draft.price))}</span>
                    <span className="ml-2 text-xs text-success-fg">
                      Save {money(Number(draft.price) - calcFinal(draft.price, draft.discountPercent))}
                    </span>
                  </>
                )}
              </div>
            ) : null}

            <Section title="Specifications" />

            <Field label="Weight (grams)" required error={err("weightGrams")}
              hint="Total weight of the finished piece.">
              <input type="number" min="0" step="0.01" className={cls("weightGrams")}
                value={draft.weightGrams}
                onChange={(e) => onUpdate({ weightGrams: e.target.value })}
                placeholder="e.g. 12.5" />
            </Field>
            <Field label="Metal" hint="Pick a common option or type your own.">
              <input className={input} value={draft.metal}
                list={`metals-${draft.key}`}
                onChange={(e) => onUpdate({ metal: e.target.value })}
                placeholder="e.g. 22K Gold, 925 Silver" />
              <datalist id={`metals-${draft.key}`}>
                {METAL_SUGGESTIONS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
            <Field label="Colors" hint="Separate each colour with a comma.">
              <input className={input} value={draft.colors}
                onChange={(e) => onUpdate({ colors: e.target.value })}
                placeholder="Gold, Rose Gold" />
              {parseColors(draft.colors).length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {parseColors(draft.colors).map((c) => (
                    <span key={c}
                      className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-muted">
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
            </Field>
            <Field label="Size" hint='Use "Free size" if one size fits all.'>
              <input className={input} value={draft.size}
                onChange={(e) => onUpdate({ size: e.target.value })}
                placeholder="e.g. 6, 7, Free size" />
            </Field>

            <Section title="Stock & identification" />

            <Field label="Quantity in stock"
              hint="How many of this piece you can fulfil right now.">
              <input type="number" min="0" className={input} value={draft.quantity}
                onChange={(e) => onUpdate({ quantity: e.target.value })}
                placeholder="0" />
            </Field>
            <Field label="Low-stock alert at"
              hint="We email you when stock drops to this number. 0 = never.">
              <input type="number" min="0" className={input} value={draft.minQuantity}
                onChange={(e) => onUpdate({ minQuantity: e.target.value })}
                placeholder="0" />
            </Field>
            <Field label="Brand name"
              hint="Defaults to your brand — change it only for sub-labels.">
              <input className={input} value={draft.brandName}
                onChange={(e) => onUpdate({ brandName: e.target.value })} />
            </Field>
            <Field label="SKU" required error={err("sku")}
              hint="Your own code for this piece. Must be unique.">
              <div className="flex items-center gap-2">
                <input className={cls("sku")} value={draft.sku}
                  onChange={(e) => onUpdate({ sku: e.target.value })}
                  placeholder="e.g. AUR-CHAINS-4821" />
                <button type="button"
                  onClick={() => onUpdate({ sku: suggestSku(draft) })}
                  className={`${buttonQuiet} shrink-0`}
                  title="Generate a SKU from your brand and product type">
                  Generate
                </button>
              </div>
            </Field>

            <Section title="Photos & video" note="At least one photo is required" />

            {/* Media — drag-drop zones */}
            <div className="sm:col-span-2">
              <ImageDropZone
                previews={previews}
                count={draft.images.length}
                error={err("images")}
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
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.key !== key) return d;
        const next = { ...d, ...patch };
        // Once everything required is filled in, stop flagging the fields.
        return next.showErrors && isReady(next) ? { ...next, showErrors: false } : next;
      })
    );
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
      weightGrams: draft.weightGrams,
      department: draft.department,
      categoryGroup: draft.categoryGroup,
      productType: draft.productType,
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
    form.append("weightGrams", d.weightGrams);
    form.append("department", d.department);
    form.append("categoryGroup", d.categoryGroup);
    form.append("productType", d.productType);
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
    const dupes = duplicateSkus(drafts);
    const pending = (d: Draft) =>
      d.submitState === "idle" || typeof d.submitState === "object";
    const ready = (d: Draft) =>
      isReady(d, dupes.has(d.sku.trim().toLowerCase()));

    // Only submit drafts that have all mandatory fields filled.
    const toSubmit = drafts.filter((d) => pending(d) && ready(d));
    const blocked = drafts.filter((d) => pending(d) && !ready(d));

    // Turn on inline errors for anything held back, so the vendor can see
    // exactly which fields are at fault rather than hunting for them.
    if (blocked.length) {
      const blockedKeys = new Set(blocked.map((d) => d.key));
      setDrafts((prev) =>
        prev.map((d) =>
          blockedKeys.has(d.key) ? { ...d, showErrors: true } : d
        )
      );
    }

    if (toSubmit.length === 0) {
      setTopMessage({
        text:
          blocked.length === 1
            ? "This product still needs a few required fields — open it to see what's missing."
            : `${blocked.length} products still need required fields — open them to see what's missing.`,
        error: true,
      });
      if (blocked.length === 1) setExpandedKey(blocked[0].key);
      return;
    }
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
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className={subheading}>Products</h2>
        <p className={`mt-2 ${muted}`}>
          Products unlock once your account is approved. Complete your profile in{" "}
          <strong>Account &amp; Details</strong> and submit for admin review.
        </p>
      </div>
    );
  }

  const dupeSkus = duplicateSkus(drafts);
  const isPending = (d: Draft) =>
    d.submitState === "idle" || typeof d.submitState === "object";
  const isDraftReady = (d: Draft) =>
    isReady(d, dupeSkus.has(d.sku.trim().toLowerCase()));

  const readyCount = drafts.filter((d) => isPending(d) && isDraftReady(d)).length;
  const notReadyCount = drafts.filter((d) => isPending(d) && !isDraftReady(d)).length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {topMessage && (
        <p className={bannerClass(topMessage.error)}>{topMessage.text}</p>
      )}

      {/* Upload queue */}
      <div className="rounded-xl border border-border bg-surface p-6">
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
              <button
                type="button"
                onClick={submitAll}
                title="Show what each product still needs"
                className={buttonPrimary}
              >
                Submit — show what&apos;s missing
              </button>
            ) : null}
          </div>
        </div>

        {/* Excel import error */}
        {importError && (
          <p className={`mb-4 ${bannerError}`}>{importError}</p>
        )}

        {/* Not-ready warning — names the fields actually outstanding */}
        {notReadyCount > 0 && (
          <p className={`mb-4 ${bannerWarning}`}>
            {readyCount > 0
              ? `${readyCount} ready to submit · ${notReadyCount} still incomplete. `
              : `${notReadyCount} product${notReadyCount > 1 ? "s" : ""} not ready yet. `}
            Still needed:{" "}
            {[
              ...new Set(
                drafts
                  .filter((d) => isPending(d) && !isDraftReady(d))
                  .flatMap((d) =>
                    missingFields(d, dupeSkus.has(d.sku.trim().toLowerCase()))
                  )
              ),
            ].join(", ")}
            .
          </p>
        )}

        {/* Import summary panel */}
        {importSummary && (
          <div className="mb-4 rounded-xl border border-border bg-surface-hover p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-heading">
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
          <div className="rounded-xl border border-dashed border-input py-12 text-center">
            <p className="font-heading text-base text-heading">Queue is empty</p>
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
                duplicateSku={dupeSkus.has(d.sku.trim().toLowerCase())}
              />
            ))}
          </div>
        )}
      </div>

      {/* Existing products */}
      <div className="rounded-xl border border-border bg-surface p-6">
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
                  className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-heading/20">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb.url} alt=""
                      className="h-12 w-12 rounded-lg border border-border object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-input text-xs text-muted">🖼</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-base text-heading">
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
                    {p.category || p.weightGrams ? (
                      <p className="text-xs text-muted">
                        {p.category}
                        {p.category && p.weightGrams ? " · " : ""}
                        {p.weightGrams ? `${p.weightGrams} g` : ""}
                      </p>
                    ) : null}
                    {p.status === "rejected" && p.rejectionReason && (
                      <p className="mt-1 text-xs text-error-fg">Rejected: {p.rejectionReason}</p>
                    )}
                  </div>
                  <span className={`${statusBadge.base} ${statusBadge[p.status]}`}>{p.status}</span>
                  <button type="button"
                    disabled={deleteBusy === p.productId}
                    onClick={() => handleDelete(p.productId)}
                    className={buttonReject}>
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
