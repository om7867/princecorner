"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/types";
import type { AnalyticsSummaryDTO } from "@/lib/types";

const CHART_COLOR = "#e7a73a";
const GRID_COLOR = "rgba(245,238,227,0.08)";
const TEXT_COLOR = "rgba(245,238,227,0.5)";

function downloadCsv(summary: AnalyticsSummaryDTO) {
  const rows = [
    ["date", "revenue", "order_count"],
    ...summary.revenue_series.map((p) => [p.date, p.revenue, String(p.order_count)]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "revenue.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-linen/10 bg-[#221913] p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-linen/50">{label}</p>
      <p className="mt-2 font-display text-2xl italic text-linen">{value}</p>
    </div>
  );
}

export function OrgAnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummaryDTO | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/admin/org/analytics/summary?days=${days}`)
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});
  }, [days]);

  if (!summary) {
    return <div className="h-64 animate-pulse rounded-3xl bg-linen/5" aria-hidden />;
  }

  return (
    <main aria-label="Organization Analytics">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl italic text-linen">Organization Analytics</h1>
          <p className="mt-1 text-sm text-linen/50">
            Revenue, best-sellers, and peak hours aggregated across every active branch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={() => downloadCsv(summary)}
            className="rounded-full border border-linen/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-linen hover:border-saffron hover:text-saffron"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Today's revenue" value={formatMoney(summary.today_revenue)} />
        <StatCard label="Today's orders" value={String(summary.today_order_count)} />
        <StatCard label="Avg order value" value={formatMoney(summary.average_order_value)} />
        <StatCard label="Pending orders" value={String(summary.pending_order_count)} />
        <StatCard label="Low stock items" value={String(summary.low_stock_count)} />
      </div>

      <div className="mt-6 rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <h2 className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-linen/50">
          Revenue over time
        </h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.revenue_series}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="date" stroke={TEXT_COLOR} tick={{ fontSize: 11 }} />
              <YAxis stroke={TEXT_COLOR} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1c1410", border: "1px solid rgba(245,238,227,0.15)", borderRadius: 8 }}
                labelStyle={{ color: "#f5eee3" }}
              />
              <Line type="monotone" dataKey="revenue" stroke={CHART_COLOR} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-linen/10 bg-[#221913] p-6">
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-linen/50">
            Best-selling items
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.top_items} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
                <XAxis type="number" stroke={TEXT_COLOR} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke={TEXT_COLOR} tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  contentStyle={{ background: "#1c1410", border: "1px solid rgba(245,238,227,0.15)", borderRadius: 8 }}
                  labelStyle={{ color: "#f5eee3" }}
                />
                <Bar dataKey="quantity" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-linen/10 bg-[#221913] p-6">
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-linen/50">
            Orders by hour of day
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.orders_by_hour}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="hour" stroke={TEXT_COLOR} tick={{ fontSize: 11 }} />
                <YAxis stroke={TEXT_COLOR} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1c1410", border: "1px solid rgba(245,238,227,0.15)", borderRadius: 8 }}
                  labelStyle={{ color: "#f5eee3" }}
                />
                <Bar dataKey="order_count" fill="#6b7a4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
