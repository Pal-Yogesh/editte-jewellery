"use client";

import { useCallback, useEffect, useState } from "react";
import {
  banner as bannerClass,
  muted,
  panel,
  subheading,
  buttonQuiet,
} from "@/app/theme";

type VendorSales = {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  unitsSold: number;
  revenue: number;
  productsSold: number;
  ordersWithSales: number;
};

type SoldProduct = {
  productId: string;
  title: string;
  sku: string;
  image: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  unitsSold: number;
  revenue: number;
  stockLeft: number;
};

type RecentSale = {
  orderId: string;
  invoiceNumber: string;
  productId: string;
  title: string;
  vendorId: string;
  vendorName: string;
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
  vendorsWithSales: number;
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

export default function AdminSales() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [vendors, setVendors] = useState<VendorSales[]>([]);
  const [products, setProducts] = useState<SoldProduct[]>([]);
  const [recent, setRecent] = useState<RecentSale[]>([]);
  const [vendorFilter, setVendorFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sales", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Could not load sales.");
        return;
      }
      setSummary(data.summary as SalesSummary);
      setVendors(data.vendors as VendorSales[]);
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

  const filteredProducts =
    vendorFilter === "all"
      ? products
      : products.filter((p) => p.vendorId === vendorFilter);

  const filteredRecent =
    vendorFilter === "all"
      ? recent
      : recent.filter((r) => r.vendorId === vendorFilter);

  if (loading) {
    return <p className={muted}>Loading sales…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={subheading}>Sales</h2>
          <p className={`${muted} mt-1`}>
            Live from paid orders — which vendor sold which product.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {vendors.length > 0 ? (
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
            >
              <option value="all">All vendors</option>
              {vendors.map((v) => (
                <option key={v.vendorId} value={v.vendorId}>
                  {v.vendorName}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="button"
            onClick={() => void load()}
            className={`gap-1.5 ${buttonQuiet}`}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className={bannerClass(true)}>{error}</div> : null}

      {summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label="Units sold" value={String(summary.totalUnits)} />
          <StatCard label="Revenue" value={money(summary.totalRevenue)} />
          <StatCard label="Vendors" value={String(summary.vendorsWithSales)} />
          <StatCard label="Products" value={String(summary.productsSold)} />
          <StatCard label="Orders" value={String(summary.ordersWithSales)} />
        </div>
      ) : null}

      <div className={panel}>
        <h3 className="font-heading text-foreground text-base mb-4">
          By vendor
        </h3>
        {vendors.length === 0 ? (
          <p className={muted}>No sales yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-[0.15em] uppercase text-muted border-b border-border">
                  <th className="pb-2 pr-3 font-medium">Vendor</th>
                  <th className="pb-2 pr-3 font-medium text-right">Units</th>
                  <th className="pb-2 pr-3 font-medium text-right">Revenue</th>
                  <th className="pb-2 pr-3 font-medium text-right">Products</th>
                  <th className="pb-2 font-medium text-right">Orders</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr
                    key={v.vendorId}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 pr-3">
                      <button
                        type="button"
                        onClick={() => setVendorFilter(v.vendorId)}
                        className="text-left hover:underline"
                      >
                        <span className="font-medium text-foreground block">
                          {v.vendorName}
                        </span>
                        <span className="text-xs text-muted">{v.vendorEmail}</span>
                      </button>
                    </td>
                    <td className="py-3 pr-3 text-right font-heading text-foreground">
                      {v.unitsSold}
                    </td>
                    <td className="py-3 pr-3 text-right text-foreground">
                      {money(v.revenue)}
                    </td>
                    <td className="py-3 pr-3 text-right text-muted">
                      {v.productsSold}
                    </td>
                    <td className="py-3 text-right text-muted">
                      {v.ordersWithSales}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={panel}>
        <h3 className="font-heading text-foreground text-base mb-4">
          By product
        </h3>
        {filteredProducts.length === 0 ? (
          <p className={muted}>No product sales for this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-[0.15em] uppercase text-muted border-b border-border">
                  <th className="pb-2 pr-3 font-medium">Product</th>
                  <th className="pb-2 pr-3 font-medium">Vendor</th>
                  <th className="pb-2 pr-3 font-medium">SKU</th>
                  <th className="pb-2 pr-3 font-medium text-right">Sold</th>
                  <th className="pb-2 pr-3 font-medium text-right">Revenue</th>
                  <th className="pb-2 font-medium text-right">Stock left</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr
                    key={p.productId}
                    className="border-b border-border/60 last:border-0"
                  >
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
                        <span className="font-medium text-foreground truncate">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-foreground block truncate max-w-[140px]">
                        {p.vendorName}
                      </span>
                      <span className="text-[10px] text-muted truncate block max-w-[140px]">
                        {p.vendorEmail}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-muted font-mono text-xs">
                      {p.sku || "—"}
                    </td>
                    <td className="py-3 pr-3 text-right font-heading text-foreground">
                      {p.unitsSold}
                    </td>
                    <td className="py-3 pr-3 text-right text-foreground">
                      {money(p.revenue)}
                    </td>
                    <td className="py-3 text-right text-muted">{p.stockLeft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={panel}>
        <h3 className="font-heading text-foreground text-base mb-4">
          Recent sales
        </h3>
        {filteredRecent.length === 0 ? (
          <p className={muted}>No recent line items.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-[0.15em] uppercase text-muted border-b border-border">
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Invoice</th>
                  <th className="pb-2 pr-3 font-medium">Vendor</th>
                  <th className="pb-2 pr-3 font-medium">Product</th>
                  <th className="pb-2 pr-3 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((r, i) => (
                  <tr
                    key={`${r.orderId}-${r.productId}-${i}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 pr-3 text-muted whitespace-nowrap">
                      {formatDate(r.soldAt)}
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs text-foreground">
                      {r.invoiceNumber}
                    </td>
                    <td className="py-3 pr-3 text-foreground truncate max-w-[120px]">
                      {r.vendorName}
                    </td>
                    <td className="py-3 pr-3 text-foreground truncate max-w-[180px]">
                      {r.title}
                    </td>
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
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-1">
        {label}
      </p>
      <p className="font-heading text-xl text-foreground">{value}</p>
    </div>
  );
}
