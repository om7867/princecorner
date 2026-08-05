"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { formatMoney } from "@/lib/types";
import type { InvoiceDTO } from "@/lib/types";

export type PrintableBillData = {
  invoiceId?: string;
  displayCode: string;
  tableCode?: string;
  channel?: string;
  createdAt: string;
  cashierName?: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    variantName?: string;
    quantity: number;
    unitPrice: number | string;
    lineTotal: number | string;
  }>;
  subtotal: number | string;
  discountAmount?: number | string;
  couponCode?: string;
  taxAmount: number | string;
  total: number | string;
  paymentMethod: string;
  amountTendered?: number | string;
  changeAmount?: number | string;
  earnedPoints?: number;
};

export function ThermalBillModal({
  billData,
  invoice,
  onClose,
  autoPrint = false,
}: {
  billData?: PrintableBillData;
  invoice?: InvoiceDTO;
  onClose: () => void;
  autoPrint?: boolean;
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Map InvoiceDTO if provided instead of billData
  const data: PrintableBillData = billData ?? {
    invoiceId: invoice?.id,
    displayCode: invoice?.orders?.[0]?.display_code ?? `INV-${invoice?.id?.slice(0, 6)}`,
    tableCode: invoice?.table_code ?? invoice?.orders?.[0]?.table_code ?? "Counter",
    channel: invoice?.orders?.[0]?.channel ?? "Dine-in",
    createdAt: invoice?.created_at ?? new Date().toISOString(),
    cashierName: "Head Cashier",
    customerPhone: invoice?.loyalty_phone ?? undefined,
    items: invoice?.orders?.flatMap((o) =>
      o.items.map((i) => ({
        name: i.name_snapshot,
        quantity: i.quantity,
        unitPrice: i.unit_price_snapshot,
        lineTotal: i.line_total,
      }))
    ) ?? [],
    subtotal: invoice?.subtotal ?? "0.00",
    discountAmount: invoice?.discount_amount ?? "0.00",
    couponCode: invoice?.coupon_code ?? undefined,
    taxAmount: invoice?.tax_amount ?? "0.00",
    total: invoice?.total ?? "0.00",
    paymentMethod: invoice?.payments?.[0]?.method?.toUpperCase() ?? "CASH",
  };

  useEffect(() => {
    if (data.customerPhone && !phoneInput) {
      setPhoneInput(data.customerPhone);
    }
  }, [data.customerPhone]);

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const formattedDate = new Date(data.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const ebillUrl = typeof window !== "undefined"
    ? `${window.location.origin}/track?id=${encodeURIComponent(data.displayCode)}`
    : `https://princecorner.com/track?id=${encodeURIComponent(data.displayCode)}`;

  useEffect(() => {
    QRCode.toDataURL(ebillUrl, { margin: 1, width: 120, color: { dark: "#120d0a", light: "#ffffff" } })
      .then(setQrCodeUrl)
      .catch(() => {});
  }, [ebillUrl]);

  function handlePrint() {
    openStandaloneEbillPrintWindow(data);
  }

  function handleWhatsAppShare(targetPhoneOverride?: string) {
    const rawPhone = targetPhoneOverride || phoneInput || data.customerPhone || "";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `🧾 *Prince Corner E-Bill*\n` +
      `Bill #${data.displayCode} | Total: ${formatMoney(data.total)}\n` +
      `Thank you for dining with us! View your digital e-bill & live receipt:\n` +
      `${ebillUrl}`
    );
    if (cleanPhone) {
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${fullPhone}?text=${text}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  }

  function handleCopyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ebillUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const cgst = Number(data.taxAmount) / 2;
  const sgst = Number(data.taxAmount) / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 print:p-0 print:bg-transparent print:static print:inset-auto print:block print:h-auto">
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          header, nav, footer, main, section, article, .no-print {
            display: none !important;
          }
          html, body {
            width: 80mm !important;
            max-width: 80mm !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt-printable, #thermal-receipt-printable * {
            visibility: visible !important;
            display: block !important;
          }
          #thermal-receipt-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: monospace, sans-serif !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Thermal Receipt Container */}
      <div className="relative w-full max-w-sm rounded-3xl border border-linen/20 bg-white p-6 text-espresso shadow-2xl print:max-w-none print:border-none print:rounded-none print:p-0 print:bg-transparent">
        
        {/* Action Buttons (Hidden on Print) */}
        <div className="no-print mb-4 space-y-2.5 border-b border-gray-200 pb-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full bg-[#b71c1c] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-105"
            >
              🖨️ Print / Download PDF
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-black"
            >
              {copied ? "✓ Link Copied!" : "🔗 Copy Link"}
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-gray-100 p-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
              aria-label="Close bill preview"
            >
              ✕
            </button>
          </div>

          {/* Quick WhatsApp E-Bill Direct Sender */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-1.5">
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Customer Phone (e.g. 9876543210)"
              className="flex-1 min-w-0 rounded-xl border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none"
            />
            <button
              onClick={() => handleWhatsAppShare()}
              className="shrink-0 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-emerald-700 active:scale-95"
            >
              📱 Send WA E-Bill
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div id="thermal-receipt-printable" className="text-center font-mono text-xs text-black">
          
          {/* Official Prince Corner Logo Header */}
          <div className="flex flex-col items-center justify-center border-b border-dashed border-gray-400 pb-3">
            <Image
              src="/princelogo.png"
              alt="Prince Corner Logo"
              width={140}
              height={50}
              className="mx-auto mb-1 h-auto w-32 object-contain"
              priority
            />
            <h1 className="text-base font-extrabold uppercase tracking-tight text-black">Prince Corner</h1>
            <p className="text-[11px] font-semibold text-gray-700">Isanpur Branch, Ahmedabad</p>
            <p className="text-[10px] text-gray-600">Near Rameshwar Shopping Center, Vatva Road</p>
            <p className="text-[10px] text-gray-600">Ph: +91 98250 12345 | GSTIN: 24AAAFP1234F1Z9</p>
            <p className="text-[10px] text-gray-600">FSSAI Lic No: 10721001000456</p>
          </div>

          {/* Receipt Info */}
          <div className="my-2 border-b border-dashed border-gray-400 py-1 text-left text-[11px]">
            <div className="flex justify-between">
              <span>Bill No: <strong className="font-bold">{data.displayCode}</strong></span>
              <span>Table: <strong className="font-bold">{data.tableCode}</strong></span>
            </div>
            <div className="flex justify-between mt-0.5">
              <span>Date: {formattedDate}</span>
              <span>Type: {data.channel?.toUpperCase()}</span>
            </div>
            {data.cashierName && (
              <div className="mt-0.5 text-[10px] text-gray-600">Cashier: {data.cashierName}</div>
            )}
            {data.customerName && (
              <div className="mt-0.5 text-[10px] text-gray-800">Guest: {data.customerName} ({data.customerPhone})</div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-black text-[10px] uppercase font-bold">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Rate</th>
                <th className="py-1 text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1 font-medium pr-1">
                    {item.name}
                    {item.variantName && <span className="block text-[9px] text-gray-500">({item.variantName})</span>}
                  </td>
                  <td className="py-1 text-center font-bold">{item.quantity}</td>
                  <td className="py-1 text-right">{Number(item.unitPrice).toFixed(2)}</td>
                  <td className="py-1 text-right font-bold">{Number(item.lineTotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="mt-2 border-t border-dashed border-gray-400 pt-2 text-[11px] text-right space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatMoney(data.subtotal)}</span>
            </div>

            {Number(data.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({data.couponCode || "Offer"}):</span>
                <span>-{formatMoney(data.discountAmount || 0)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 text-[10px]">
              <span>CGST (2.5%):</span>
              <span>{formatMoney(cgst)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[10px]">
              <span>SGST (2.5%):</span>
              <span>{formatMoney(sgst)}</span>
            </div>

            <div className="flex justify-between border-t border-b border-black py-1.5 font-bold text-sm text-black">
              <span>GRAND TOTAL:</span>
              <span>{formatMoney(data.total)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="my-2 text-left text-[10px] space-y-0.5 bg-gray-50 p-2 rounded">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase text-emerald-700">{data.paymentMethod} (PAID)</span>
            </div>
            {data.amountTendered && Number(data.amountTendered) > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Cash Tendered:</span>
                  <span>{formatMoney(data.amountTendered)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change Returned:</span>
                  <span>{formatMoney(data.changeAmount || 0)}</span>
                </div>
              </>
            )}
            {data.earnedPoints && data.earnedPoints > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold mt-1">
                <span>⭐ Loyalty Points Earned:</span>
                <span>+{data.earnedPoints} pts</span>
              </div>
            )}
          </div>

          {/* QR Code & Footer */}
          <div className="mt-3 flex flex-col items-center justify-center text-center">
            {qrCodeUrl && (
              <Image
                src={qrCodeUrl}
                alt="E-Bill QR"
                width={80}
                height={80}
                className="mb-1 h-20 w-20 object-contain"
              />
            )}
            <p className="text-[9px] text-gray-500 font-sans">Scan for Digital E-Bill &amp; Feedback</p>
            <p className="mt-2 text-[11px] font-bold text-black uppercase tracking-wider">
              Thank You! Visit Again!
            </p>
            <p className="text-[9px] text-gray-500">Prince Corner — Taste the Tradition</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export async function openStandaloneEbillPrintWindow(data: PrintableBillData) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://princecorner.com";
  const ebillUrl = `${origin}/track?id=${encodeURIComponent(data.displayCode)}`;

  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(ebillUrl, { margin: 1, width: 120, color: { dark: "#120d0a", light: "#ffffff" } });
  } catch {}

  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (!printWindow) {
    window.print();
    return;
  }

  const formattedDate = new Date(data.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const cgst = (Number(data.taxAmount) / 2).toFixed(2);
  const sgst = (Number(data.taxAmount) / 2).toFixed(2);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Prince Corner E-Bill ${data.displayCode}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            background: #ffffff;
            color: #120d0a;
            margin: 0;
            padding: 20px;
          }
          .bill-card {
            max-width: 420px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #9ca3af;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .logo {
            width: 140px;
            height: auto;
            display: block;
            margin: 0 auto 6px auto;
            object-fit: contain;
          }
          .brand {
            font-size: 20px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
          }
          .sub {
            font-size: 11px;
            color: #4b5563;
            margin: 3px 0 0 0;
          }
          .info {
            font-size: 11px;
            border-bottom: 1px dashed #9ca3af;
            padding-bottom: 10px;
            margin-bottom: 12px;
            line-height: 1.6;
          }
          .row {
            display: flex;
            justify-content: space-between;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 12px;
          }
          th {
            text-align: left;
            border-bottom: 1px solid #120d0a;
            padding: 6px 0;
            font-size: 10px;
            text-transform: uppercase;
          }
          td {
            padding: 6px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .right { text-align: right; }
          .center { text-align: center; }
          .totals {
            border-top: 1px dashed #9ca3af;
            padding-top: 10px;
            font-size: 12px;
          }
          .totals .row { margin-bottom: 4px; }
          .grand-total {
            border-top: 2px solid #120d0a;
            border-bottom: 2px solid #120d0a;
            padding: 8px 0;
            margin-top: 8px;
            font-size: 16px;
            font-weight: 800;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 11px;
            color: #6b7280;
          }
          .qr-img {
            width: 85px;
            height: 85px;
            display: block;
            margin: 0 auto 4px auto;
            object-fit: contain;
          }
          .btn-bar {
            text-align: center;
            margin-bottom: 20px;
          }
          .print-btn {
            background: #b71c1c;
            color: #ffffff;
            border: none;
            padding: 10px 24px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 9999px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(183,28,28,0.3);
          }
          @media print {
            .no-print { display: none !important; }
            .bill-card { border: none; box-shadow: none; padding: 0; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="btn-bar no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
        </div>
        <div class="bill-card">
          <div class="header">
            <img src="${origin}/princelogo.png" alt="Prince Corner Logo" class="logo" />
            <h1 class="brand">Prince Corner</h1>
            <p class="sub">Isanpur Branch, Ahmedabad</p>
            <p class="sub">Near Rameshwar Shopping Center, Vatva Road</p>
            <p class="sub">Ph: +91 98250 12345 | GSTIN: 24AAAFP1234F1Z9</p>
            <p class="sub">FSSAI Lic No: 10721001000456</p>
          </div>
          <div class="info">
            <div class="row">
              <span>Bill No: <strong>${data.displayCode}</strong></span>
              <span>Table: <strong>${data.tableCode || 'DINE-IN'}</strong></span>
            </div>
            <div class="row">
              <span>Date: ${formattedDate}</span>
              <span>Type: ${data.channel?.toUpperCase() || 'DINE-IN'}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qty</th>
                <th class="right">Rate</th>
                <th class="right">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(i => `
                <tr>
                  <td><strong>${i.name}</strong>${i.variantName ? `<br><small style="color:#666">(${i.variantName})</small>` : ''}</td>
                  <td class="center"><strong>${i.quantity}</strong></td>
                  <td class="right">₹${Number(i.unitPrice).toFixed(2)}</td>
                  <td class="right"><strong>${Number(i.lineTotal).toFixed(2)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="row">
              <span>Subtotal:</span>
              <span>₹${Number(data.subtotal).toFixed(2)}</span>
            </div>
            ${Number(data.discountAmount) > 0 ? `
              <div class="row" style="color:#047857; font-weight:bold;">
                <span>Discount (${data.couponCode || 'Offer'}):</span>
                <span>-₹${Number(data.discountAmount).toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="row" style="color:#4b5563; font-size:11px;">
              <span>CGST (2.5%):</span>
              <span>₹${cgst}</span>
            </div>
            <div class="row" style="color:#4b5563; font-size:11px;">
              <span>SGST (2.5%):</span>
              <span>₹${sgst}</span>
            </div>
            <div class="row grand-total">
              <span>GRAND TOTAL:</span>
              <span>₹${Number(data.total).toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="E-Bill QR Code" class="qr-img" />` : ''}
            <p style="margin:0 0 4px 0; font-size:10px; color:#6b7280;">Scan for Digital E-Bill &amp; Feedback</p>
            <p style="margin:0; font-weight:bold; color:#120d0a;">THANK YOU! VISIT AGAIN!</p>
            <p style="margin:4px 0 0 0; font-size:10px;">Prince Corner — Taste the Tradition</p>
          </div>
        </div>
        <script>
          setTimeout(function() { window.print(); }, 450);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
