"use client";

import { useCallback, useState } from "react";
import { buttonPrimary, input, label as labelClass, muted } from "@/app/theme";

/** Compact primary action for the quick-add strip. */
const buttonQuietAdd = `${buttonPrimary} px-4 py-2`;

// ─── Limits (must mirror the server-side constants) ───────────────────────────
export const LIMITS = {
  image: {
    minBytes: 20 * 1024,          // 20 KB
    maxBytes: 5 * 1024 * 1024,    //  5 MB
    minPx: 800,                    // min 800 × 800 px
    accept: "image/png,image/jpeg,image/webp",
    maxCount: 6,
  },
  video: {
    minBytes: 500 * 1024,          // 500 KB
    maxBytes: 50 * 1024 * 1024,    //  50 MB
    minWidth: 1280,                 // min 720p width
    minHeight: 720,
    accept: "video/mp4,video/webm,video/quicktime",
  },
};

function humanSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/** Validates a single image file — returns an error string or null. */
async function validateImage(file: File): Promise<string | null> {
  const { minBytes, maxBytes } = LIMITS.image;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return "Must be PNG, JPEG or WebP";
  }
  if (file.size < minBytes) return `Too small (min ${humanSize(minBytes)})`;
  if (file.size > maxBytes) return `Too large (max ${humanSize(maxBytes)})`;

  // Dimension check via HTMLImageElement
  try {
    const url = URL.createObjectURL(file);
    const { w, h } = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      img.onload  = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(); };
      img.src = url;
    });
    const min = LIMITS.image.minPx;
    if (w < min || h < min) return `Too small (min ${min}×${min} px, got ${w}×${h})`;
  } catch {
    return "Could not read image dimensions";
  }
  return null;
}

/** Validates a video file — returns an error string or null. */
async function validateVideo(file: File): Promise<string | null> {
  const { minBytes, maxBytes } = LIMITS.video;
  if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
    return "Must be MP4, WebM or MOV";
  }
  if (file.size < minBytes) return `Too small (min ${humanSize(minBytes)})`;
  if (file.size > maxBytes) return `Too large (max ${humanSize(maxBytes)})`;

  // Dimension check via HTMLVideoElement
  try {
    const url = URL.createObjectURL(file);
    const { w, h } = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const vid = document.createElement("video");
      vid.preload = "metadata";
      vid.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({ w: vid.videoWidth, h: vid.videoHeight });
      };
      vid.onerror = () => { URL.revokeObjectURL(url); reject(); };
      vid.src = url;
    });
    if (w < LIMITS.video.minWidth || h < LIMITS.video.minHeight) {
      return `Resolution too low (min ${LIMITS.video.minWidth}×${LIMITS.video.minHeight}, got ${w}×${h})`;
    }
  } catch {
    return "Could not read video dimensions";
  }
  return null;
}

// ─── ImageDropZone ─────────────────────────────────────────────────────────────

type ImageDropZoneProps = {
  /** Shown under the zone when the draft was submitted without an image. */
  error?: string;
  previews: string[];
  count: number;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
};

export function ImageDropZone({ previews, count, onAdd, onRemove, error }: ImageDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);
  const max = LIMITS.image.maxCount;
  const slots = max - count;

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).slice(0, slots);
      if (files.length === 0) return;
      setValidating(true);
      setErrors([]);

      const valid: File[] = [];
      const errs: string[] = [];
      await Promise.all(
        files.map(async (f) => {
          const err = await validateImage(f);
          if (err) errs.push(`${f.name}: ${err}`);
          else valid.push(f);
        })
      );
      setErrors(errs);
      if (valid.length) onAdd(valid);
      setValidating(false);
    },
    [slots, onAdd]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void processFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <label className={labelClass}>
        Images <span className="text-rose">*</span> ({count}/{max} · min 800×800 px ·
        20 KB – 5 MB)
      </label>

      {/* Thumbnail row */}
      {previews.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-16 w-16 rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white text-xs leading-none"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {slots > 0 ? (
        <div
          className={`flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-4 text-center transition ${
            dragging
              ? "border-primary bg-primary/5"
              : error
              ? "border-error-fg hover:bg-surface-hover"
              : "border-input hover:border-primary/50 hover:bg-surface-hover"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => {
            const el = document.createElement("input");
            el.type = "file";
            el.accept = LIMITS.image.accept;
            el.multiple = true;
            el.onchange = () => { if (el.files) void processFiles(el.files); };
            el.click();
          }}
        >
          {validating ? (
            <p className={`${muted} animate-pulse`}>Checking images…</p>
          ) : (
            <>
              <p className="font-heading text-base text-heading">Drop images here or click to browse</p>
              <p className={`mt-0.5 text-xs ${muted}`}>
                PNG · JPEG · WebP · min 800×800 px · 20 KB – 5 MB · {slots} slot{slots > 1 ? "s" : ""} remaining
              </p>
            </>
          )}
        </div>
      ) : (
        <p className={`text-xs ${muted}`}>Maximum {max} images reached.</p>
      )}

      {error ? <p className="mt-1 text-xs text-error-fg">{error}</p> : null}

      {errors.map((e, i) => (
        <p key={i} className="mt-1 text-xs text-error-fg">{e}</p>
      ))}
    </div>
  );
}

// ─── VideoDropZone ─────────────────────────────────────────────────────────────

type VideoDropZoneProps = {
  videoName: string | null;
  onSet: (file: File | null) => void;
  /** Existing uploaded video label (edit flow). */
  existingVideoLabel?: string | null;
  onRemoveExisting?: () => void;
};

export function VideoDropZone({
  videoName,
  onSet,
  existingVideoLabel,
  onRemoveExisting,
}: VideoDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setValidating(true);
      setError(null);
      const err = await validateVideo(file);
      if (err) { setError(err); setValidating(false); return; }
      onSet(file);
      setValidating(false);
    },
    [onSet]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  return (
    <div>
      <label className={labelClass}>
        Video (optional · min 1280×720 · 500 KB – 50 MB)
      </label>

      {videoName ? (
        <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm">
          <span className="flex-1 truncate text-foreground">📹 {videoName}</span>
          <button
            type="button"
            onClick={() => { onSet(null); setError(null); }}
            className="text-[10px] uppercase tracking-[0.15em] text-danger transition-colors hover:opacity-70"
          >
            Remove
          </button>
        </div>
      ) : existingVideoLabel ? (
        <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm">
          <span className="flex-1 truncate text-foreground">📹 {existingVideoLabel}</span>
          <button
            type="button"
            onClick={() => onRemoveExisting?.()}
            className="text-[10px] uppercase tracking-[0.15em] text-danger transition-colors hover:opacity-70"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          className={`flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-3 text-center transition ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-input hover:border-primary/50 hover:bg-surface-hover"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => {
            const el = document.createElement("input");
            el.type = "file";
            el.accept = LIMITS.video.accept;
            el.onchange = () => { if (el.files?.[0]) void processFile(el.files[0]); };
            el.click();
          }}
        >
          {validating ? (
            <p className={`${muted} animate-pulse`}>Checking video…</p>
          ) : (
            <>
              <p className="font-heading text-base text-heading">Drop video here or click to browse</p>
              <p className={`mt-0.5 text-xs ${muted}`}>MP4 · WebM · MOV · min 720p · 500 KB – 50 MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-error-fg">{error}</p>}
    </div>
  );
}

// ─── Quick-add input ────────────────────────────────────────────────────────────

type QuickAddProps = {
  defaultBrand: string;
  onAdd: (title: string, sku: string, price: string, brand: string) => void;
};

export function QuickAddStrip({ defaultBrand, onAdd }: QuickAddProps) {
  const [title, setTitle] = useState("");
  const [sku, setSku]   = useState("");
  const [price, setPrice] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), sku.trim(), price.trim(), defaultBrand);
    setTitle(""); setSku(""); setPrice("");
  };

  return (
    <div className="rounded-xl border border-border bg-field px-5 py-4">
      <p className="mb-3 text-xs uppercase tracking-[0.12em] text-cacao/70">
        Quick add
      </p>
      <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-40 flex-1">
        <label className={labelClass}>Title</label>
        <input
          className={input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Product name…"
        />
      </div>
      <div className="w-28">
        <label className={labelClass}>SKU</label>
        <input
          className={input}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="RING-001"
        />
      </div>
      <div className="w-28">
        <label className={labelClass}>Price (₹)</label>
        <input
          type="number"
          min="0"
          className={input}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="0"
        />
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={!title.trim()}
        className={buttonQuietAdd}
      >
        Add to queue
      </button>
      </div>
      <p className={`mt-3 ${muted} text-xs`}>
        Enter a title and press Return — then expand the card to add category,
        photos, and the rest.
      </p>
    </div>
  );
}
