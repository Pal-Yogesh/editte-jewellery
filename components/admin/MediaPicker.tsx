"use client";
import { useState, useEffect } from "react";

interface MediaItem { id: string; filename: string; url: string; type: string; }

interface Props {
  name: string;
  label?: string;
  value?: string;
  onChange?: (url: string) => void;
}

export default function MediaPicker({ name, label = "Image URL", value = "", onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState(value);
  const [loading, setLoading] = useState(false);

  async function loadMedia() {
    if (media.length) { setOpen(true); return; }
    setLoading(true);
    const res = await fetch("/api/admin/media");
    if (res.ok) setMedia(await res.json());
    setLoading(false);
    setOpen(true);
  }

  function pick(url: string) {
    setSelected(url);
    onChange?.(url);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs tracking-[0.15em] uppercase text-ink/60">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          name={name}
          value={selected}
          onChange={(e) => { setSelected(e.target.value); onChange?.(e.target.value); }}
          placeholder="Paste URL or pick from library"
          className="flex-1 border-b border-ink/20 bg-transparent pb-2 pt-1 text-sm text-ink outline-none focus:border-cacao transition-colors placeholder:text-ink/30"
        />
        <button
          type="button"
          onClick={loadMedia}
          disabled={loading}
          className="text-xs text-cacao border border-cacao/30 px-3 py-1 hover:bg-cacao hover:text-white transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? "…" : "Pick"}
        </button>
      </div>
      {selected && selected.startsWith("http") && (
        <img src={selected} alt="preview" className="mt-2 w-24 h-16 object-cover rounded border border-ink/10" />
      )}

      {/* Media picker modal */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-cacao/40" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-20 bottom-20 z-50 bg-salt rounded-xl overflow-hidden flex flex-col shadow-2xl md:inset-x-20 lg:inset-x-40">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
              <p className="font-heading text-cacao text-base">Media Library</p>
              <button onClick={() => setOpen(false)} className="text-ink/40 hover:text-cacao text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {media.filter((m) => m.type.startsWith("image/")).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pick(m.url)}
                  className={`rounded border-2 overflow-hidden transition-colors ${selected === m.url ? "border-sage" : "border-transparent hover:border-ink/20"}`}
                >
                  <img src={m.url} alt={m.filename} className="w-full h-20 object-cover" />
                  <p className="text-[9px] text-ink/40 p-1 truncate">{m.filename}</p>
                </button>
              ))}
              {media.filter((m) => m.type.startsWith("image/")).length === 0 && (
                <p className="col-span-full text-ink/40 text-sm text-center py-10">No images in library. Upload some first.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
