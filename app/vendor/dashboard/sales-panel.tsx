"use client";

import { useCallback, useEffect, useState } from "react";
import {
  banner as bannerClass,
  muted,
  panel,
  subheading,
} from "@/app/theme";

type SoldProduct = {
  productId: string;
  title: string;
  sku: string;
  image: string;
  unitsSold: number;
  revenue: number;
  stockLeft: number;
};

type RecentSale = {
  orderId: string;
  invoiceNumber: string;
  productId: string;
  title: string;
  quantity: number;
  price: number;
  lineTotal: number;
  soldAt: number;
  customerName: string;
};

type SalesSummary = {
  totalUnits: number;
  totalRevenue: number;
  productsSold: number;
  ordersWithSales: number;
};

function money(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SalesPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [products, setProducts] = useState<SoldProduct[]>([]);
  const [recent, setRecent] = useState<RecentSale[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vendor/sales", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Could not load sales.");
        return;
      }
      setSummary(data.summary as SalesSummary);
      setProducts(data.products as SoldProduct[]);
      setRecent(data.recent as RecentSale[]);
    } catch {
      setError("Could not load sales.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className={muted}>Loading sales…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={subheading}>Sales</h2>
          <p className={`${muted} mt-1`}>
            Units sold and revenue from paid customer orders for your products.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className={bannerClass(true)}>{error}</div>
      ) : null}

      {summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Units sold" value={String(summary.totalUnits)} />
          <StatCard label="Revenue" value={money(summary.totalRevenue)} />
          <StatCard label="Products sold" value={String(summary.productsSold)} />
          <StatCard label="Orders" value={String(summary.ordersWithSales)} />
        </div>
      ) : null}

      <div className={panel}>
        <h3 className="font-heading text-foreground text-base mb-4">By product</h3>
        {products.length === 0 ? (
          <p className={muted}>No sales yet. When customers buy your products, they appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-[0.15em] uppercase text-muted border-b border-border">
                  <th className="pb-2 pr-3 font-medium">Product</th>
                  <th className="pb-2 pr-3 font-medium">SKU</th>
                  <th className="pb-2 pr-3 font-medium text-right">Sold</th>
                  <th className="pb-2 pr-3 font-medium text-right">Revenue</th>
                  <th className="pb-2 font-medium text-right">Stock left</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productId} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image}
                            alt=""
                            className="w-10 h-10 object-cover rounded-sm bg-surface-hover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-sm bg-surface-hover shrink-0 flex items-center justify-center text-[10px] text-muted">
                            —
                          </div>
                        )}
                        <span className="font-medium text-foreground truncate">{p.title}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-muted font-mono text-xs">{p.sku || "—"}</td>
                    <td className="py-3 pr-3 text-right font-heading text-foreground">{p.unitsSold}</td>
                    <td className="py-3 pr-3 text-right text-foreground">{money(p.revenue)}</td>
                    <td className="py-3 text-right text-muted">{p.stockLeft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={panel}>
        <h3 className="font-heading text-foreground text-base mb-4">Recent sales</h3>
        {recent.length === 0 ? (
          <p className={muted}>No recent line items.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-[0.15em] uppercase text-muted border-b border-border">
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Invoice</th>
                  <th className="pb-2 pr-3 font-medium">Product</th>
                  <th className="pb-2 pr-3 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr
                    key={`${r.orderId}-${r.productId}-${i}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 pr-3 text-muted whitespace-nowrap">{formatDate(r.soldAt)}</td>
                    <td className="py-3 pr-3 font-mono text-xs text-foreground">{r.invoiceNumber}</td>
                    <td className="py-3 pr-3 text-foreground truncate max-w-[200px]">{r.title}</td>
                    <td className="py-3 pr-3 text-right">{r.quantity}</td>
                    <td className="py-3 text-right">{money(r.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-4">
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-1">{label}</p>
      <p className="font-heading text-xl text-foreground">{value}</p>
    </div>
  );
}
