"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

export function QRGrid({ tables }: { tables: string[] }) {
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const base = window.location.origin;
      const generated: Record<string, string> = {};
      for (const table of tables) {
        generated[table] = await QRCode.toDataURL(
          `${base}/order?table=${table}`,
          {
            width: 260,
            margin: 1,
            color: { dark: "#2e1e12", light: "#f5eee3" },
          }
        );
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
        <button
          onClick={() => window.print()}
          className="rounded-full bg-saffron px-6 py-2.5 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02]"
        >
          Print all
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 print:gap-8">
        {tables.map((table) => (
          <div
            key={table}
            className="flex flex-col items-center rounded-3xl border border-linen/10 bg-linen p-5 text-center print:break-inside-avoid print:border-espresso/20"
          >
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-terracotta">
              Scan to order
            </p>
            <p className="font-display text-2xl italic text-espresso">
              Table {table.replace("T", "")}
            </p>
            {codes[table] ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL from client-side QR generation
              <img
                src={codes[table]}
                alt={`QR code for table ${table}`}
                className="mt-3 h-36 w-36"
              />
            ) : (
              <div className="mt-3 h-36 w-36 animate-pulse rounded-xl bg-espresso/10" aria-hidden />
            )}
            <p className="mt-2 text-[10px] text-espresso/50">Smaplee · no app needed</p>
            <Link
              href={`/order?table=${table}`}
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
