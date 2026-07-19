"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { TableDTO } from "@/lib/types";

export function QRGrid({ initialTables }: { initialTables: TableDTO[] }) {
  const { settings } = useSiteSettings();
  const [tables, setTables] = useState<TableDTO[]>(initialTables);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState("");
  const [bulkCount, setBulkCount] = useState(3);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const base = window.location.origin;
      const generated: Record<string, string> = {};
      for (const table of tables) {
        if (!table.is_active) continue;
        generated[table.code] = await QRCode.toDataURL(`${base}/order?table=${table.code}`, {
          width: 260,
          margin: 1,
          color: { dark: "#2e1e12", light: "#f5eee3" },
        });
      }
      if (!cancelled) {
        setCodes(generated);
        setOrigin(base);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tables]);

  async function addTable() {
    const nextN =
      Math.max(0, ...tables.map((t) => Number(/^T(\d+)$/.exec(t.code)?.[1] ?? 0))) + 1;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: `T${nextN}` }),
      });
      if (res.ok) {
        const created: TableDTO = await res.json();
        setTables((prev) => [...prev, created]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function bulkGenerate() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tables/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: bulkCount }),
      });
      if (res.ok) {
        const created: TableDTO[] = await res.json();
        setTables((prev) => [...prev, ...created]);
      }
    } finally {
      setBusy(false);
    }
  }

  const activeTables = tables.filter((t) => t.is_active);

  return (
    <main aria-label="Table QR codes">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-3xl italic text-linen">Table QR codes</h1>
          <p className="mt-1 max-w-xl text-sm text-linen/50">
            One code per table. A guest scans it, the menu opens in their
            browser — no app — and their order lands on the Live Orders board
            tagged with the table number.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={addTable}
            disabled={busy}
            className="rounded-full border border-linen/20 px-5 py-2.5 font-body text-sm font-semibold text-linen transition-colors hover:border-saffron hover:text-saffron disabled:opacity-50"
          >
            + Add table
          </button>
          <input
            type="number"
            min={1}
            max={50}
            value={bulkCount}
            onChange={(e) => setBulkCount(Math.max(1, Math.min(50, Number(e.target.value))))}
            className="w-16 rounded-full border border-linen/20 bg-transparent px-3 py-2.5 text-center text-sm text-linen focus:border-saffron focus:outline-none"
            aria-label="Bulk generate count"
          />
          <button
            onClick={bulkGenerate}
            disabled={busy}
            className="rounded-full border border-linen/20 px-5 py-2.5 font-body text-sm font-semibold text-linen transition-colors hover:border-saffron hover:text-saffron disabled:opacity-50"
          >
            Bulk generate
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-full bg-saffron px-6 py-2.5 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02]"
          >
            Print all
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 print:gap-8">
        {activeTables.map((table) => (
          <div
            key={table.id}
            className="flex flex-col items-center rounded-3xl border border-linen/10 bg-linen p-5 text-center print:break-inside-avoid print:border-espresso/20"
          >
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-terracotta">
              Scan to order
            </p>
            <p className="font-display text-2xl italic text-espresso">
              Table {table.code.replace("T", "")}
            </p>
            {codes[table.code] ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL from client-side QR generation
              <img
                src={codes[table.code]}
                alt={`QR code for table ${table.code}`}
                className="mt-3 h-36 w-36"
              />
            ) : (
              <div className="mt-3 h-36 w-36 animate-pulse rounded-xl bg-espresso/10" aria-hidden />
            )}
            <p className="mt-2 text-[10px] text-espresso/50">{settings?.name ?? ""} · no app needed</p>
            <Link
              href={`/order?table=${table.code}`}
              target="_blank"
              className="mt-3 text-xs font-semibold text-terracotta underline-offset-2 hover:underline print:hidden"
            >
              Open guest view →
            </Link>
          </div>
        ))}
      </div>

      {origin && (
        <p className="mt-6 text-xs text-linen/35 print:hidden">
          Codes point at {origin}/order?table=… — reprint after deploying to a
          new domain.
        </p>
      )}
    </main>
  );
}
