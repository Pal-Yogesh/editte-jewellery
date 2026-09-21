"use client";

import { useCallback, useEffect, useState } from "react";
import {
  banner as bannerClass,
  buttonPrimary,
  muted,
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
  finalPrice: number;
  price: number;
  discountPercent: number;
  quantity: number;
  sku: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  media: ProductMedia[];
};

function money(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function InventoryPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ text: string; error: boolean } | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/vendor/products", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products as Product[]);
        const q: Record<string, number> = {};
        for (const p of data.products as Product[]) {
          q[p.productId] = p.quantity;
        }
        setQuantities(q);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const increment = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  };

  const decrement = (productId: string) => {
    setQuantities((prev) => {
      const current = prev[productId] ?? 0;
      if (current <= 0) return prev;
      return { ...prev, [productId]: current - 1 };
    });
  };

  const setExact = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setQuantities((prev) => ({ ...prev, [productId]: num }));
    }
  };

  const hasChanges = products.some((p) => quantities[p.productId] !== p.quantity);

  const handleSave = async () => {
    setSaving(true);
    setBanner(null);
    try {
      const updates = Object.entries(quantities)
        .filter(([productId, qty]) => {
          const original = products.find((p) => p.productId === productId);
          return original && original.quantity !== qty;
        })
        .map(([productId, quantity]) => ({ productId, quantity }));

      if (updates.length === 0) {
        setBanner({ text: "No changes to save.", error: false });
        return;
      }

      const res = await fetch("/api/vendor/products/quantity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (res.ok) {
        setBanner({ text: data.message || "Quantities updated.", error: false });
        await loadProducts();
      } else {
        setBanner({ text: data.message || "Failed to update quantities.", error: true });
      }
    } catch {
      setBanner({ text: "Request failed. Please try again.", error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className={muted}>Loading inventory…</p>
      </div>
    );
  }

  const approvedProducts = products.filter((p) => p.status === "approved");

  return (
    <div className="space-y-6">
      {banner && (
        <p className={bannerClass(banner.error)}>{banner.text}</p>
      )}

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className={subheading}>Inventory</h2>
          {hasChanges && (
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className={buttonPrimary}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          )}
        </div>

        {approvedProducts.length === 0 ? (
          <p className={muted}>
            No approved products yet. Products must be approved before you can
            manage inventory.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-hover text-left text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Current Qty</th>
                  <th className="px-4 py-3">New Qty</th>
                  <th className="px-4 py-3">Adjust</th>
                </tr>
              </thead>
              <tbody>
                {approvedProducts.map((p) => {
                  const thumb = p.media.find((m) => m.kind === "image");
                  const currentQty = p.quantity;
                  const newQty = quantities[p.productId] ?? currentQty;
                  const changed = newQty !== currentQty;

                  return (
                    <tr
                      key={p.productId}
                      className={`border-b border-border last:border-b-0 ${
                        changed ? "bg-warning-bg/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb.url}
                              alt=""
                              className="h-10 w-10 rounded-lg border border-border object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-input text-xs text-muted">
                              🖼
                            </div>
                          )}
                          <span className="truncate font-heading text-base text-heading">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{p.sku}</td>
                      <td className="px-4 py-3 text-muted">
                        {money(p.finalPrice)}
                      </td>
                      <td className="px-4 py-3 text-muted">{currentQty}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={newQty}
                          onChange={(e) => setExact(p.productId, e.target.value)}
                          className="w-20 rounded-lg border border-input bg-field px-2 py-1.5 text-center text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/10"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => decrement(p.productId)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm text-muted transition-colors hover:border-heading hover:text-heading disabled:opacity-40"
                            disabled={newQty <= 0}
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() => increment(p.productId)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm text-muted transition-colors hover:border-heading hover:text-heading"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
