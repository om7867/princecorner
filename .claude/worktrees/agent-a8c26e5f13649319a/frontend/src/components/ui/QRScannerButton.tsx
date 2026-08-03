"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type DetectedBarcode = { rawValue: string };
type BarcodeDetectorInstance = { detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]> };
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

/** Pulls a table code out of a scanned value — either a full `/order?table=`
 * URL (what the printed table QR codes encode) or a bare code typed/scanned
 * on its own. */
function extractTableCode(value: string): string | null {
  try {
    const url = new URL(value);
    const table = url.searchParams.get("table");
    if (table) return table;
  } catch {
    // not a URL — fall through to treating it as a bare code
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function QRScannerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  function goToTable(code: string) {
    stopCamera();
    setOpen(false);
    router.push(`/order?table=${encodeURIComponent(code)}`);
  }

  function stopCamera() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function start() {
      if (!window.BarcodeDetector) {
        setError("Live camera scanning isn't supported in this browser — enter the table code below instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (results.length > 0) {
              const code = extractTableCode(results[0].rawValue);
              if (code) {
                goToTable(code);
                return;
              }
            }
          } catch {
            // transient decode errors are expected mid-frame — keep scanning
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) {
          setError("Couldn't access the camera — enter the table code below instead.");
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualCode.trim()) goToTable(manualCode);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label="Scan a table QR code to order"
        className="flex items-center justify-center rounded-full bg-espresso shadow-lg shadow-black/25 transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
        style={{ width: 52, height: 52 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="#e7a73a" strokeWidth="1.6" />
          <rect x="14" y="3" width="7" height="7" rx="1.2" stroke="#e7a73a" strokeWidth="1.6" />
          <rect x="3" y="14" width="7" height="7" rx="1.2" stroke="#e7a73a" strokeWidth="1.6" />
          <path
            d="M14 14h3v3h-3zM20 14v3M14 20h3M18 18h3v3h-3z"
            stroke="#e7a73a"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Scan table QR code"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="glass-dark w-full max-w-sm rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl italic text-linen">Scan your table</h2>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setOpen(false);
                }}
                aria-label="Close scanner"
                className="rounded-full p-1.5 text-linen/70 transition-colors hover:text-linen"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {!error && (
              <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-saffron/70"
                />
              </div>
            )}

            <p className="mt-4 text-center text-sm text-linen/70">
              {error ?? "Point your camera at the QR code on your table."}
            </p>

            <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
              <label htmlFor="manual-table-code" className="sr-only">
                Table code
              </label>
              <input
                id="manual-table-code"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Or type your table code (e.g. T5)"
                className="w-full rounded-xl border border-linen/20 bg-espresso/40 px-4 py-2.5 font-body text-sm text-linen placeholder:text-linen/40 focus:border-saffron focus:outline-none [color-scheme:dark]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-saffron px-4 py-2.5 font-body text-sm font-semibold text-espresso transition-transform hover:scale-105"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
