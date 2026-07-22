"use client";
import { useActionState } from "react";
import { deleteMediaAction } from "@/app/actions/adminMedia";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  storagePath: string;
  type: string;
  size: number;
  createdAt: number;
}

function MediaCard({ item, onCopy }: { item: MediaItem; onCopy: (url: string) => void }) {
  const [state, action, pending] = useActionState(deleteMediaAction, undefined);
  const isImage = item.type.startsWith("image/");
  const sizeKB = Math.round(item.size / 1024);

  return (
    <div className="bg-white rounded-xl border border-ink/5 overflow-hidden group">
      {/* Preview */}
      <div className="w-full h-36 bg-salt flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">📄</span>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-ink/70 truncate">{item.filename}</p>
        <p className="text-[10px] text-ink/30 mt-0.5">{sizeKB} KB</p>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { navigator.clipboard.writeText(item.url); onCopy(item.url); }}
            className="flex-1 text-[10px] text-center border border-ink/20 py-1.5 rounded hover:border-cacao hover:text-cacao transition-colors tracking-wide"
          >
            Copy URL
          </button>
          <form action={action}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="storagePath" value={item.storagePath} />
            <button
              type="submit"
              disabled={pending}
              className="text-[10px] border border-rose/30 text-rose py-1.5 px-3 rounded hover:bg-rose hover:text-white transition-colors"
            >
              {pending ? "…" : "Delete"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  // Need useState imported
  return (
    <div>
      {copied && (
        <p className="text-xs text-sage bg-sage/10 px-4 py-2 rounded mb-4 inline-block">
          ✓ URL copied to clipboard
        </p>
      )}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink/5 px-6 py-16 text-center">
          <p className="text-3xl mb-3">⊞</p>
          <p className="font-heading text-cacao">No media yet</p>
          <p className="text-ink/40 text-sm mt-1">Upload images and files above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onCopy={(url) => { setCopied(url); setTimeout(() => setCopied(null), 2000); }} />
          ))}
        </div>
      )}
    </div>
  );
}

// useState needs to be imported
import { useState } from "react";
