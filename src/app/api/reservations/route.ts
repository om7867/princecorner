import { NextResponse } from "next/server";

type ReservationRequest = {
  name?: string;
  phone?: string;
  date?: string;
  time?: string;
  party?: string;
  note?: string;
};

/**
 * Demo booking endpoint. Validates and acknowledges with a reference code.
 * Swap the marked block for a real integration (email service, OpenTable/
 * Resy webhook, Google Sheet, or a database) when a client goes live.
 */
export async function POST(request: Request) {
  let body: ReservationRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const date = body.date?.trim() ?? "";
  const time = body.time?.trim() ?? "";
  const party = body.party?.trim() ?? "";

  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone))
    errors.phone = "Please enter a valid phone number.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = "Please pick a date.";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(`${date}T00:00:00`) < today)
      errors.date = "That date has already passed.";
  }
  if (!/^\d{2}:\d{2}$/.test(time)) errors.time = "Please pick a time.";
  if (!/^\d+$/.test(party) || Number(party) < 1 || Number(party) > 20)
    errors.party = "Party size must be between 1 and 20.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const reference = `SMP-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(
    Math.random() * 90 + 10
  )}`;

  /* ── integration point ─────────────────────────────────────────────
     Replace with: await sendEmail(...) / await fetch(bookingWebhook, ...)
     For the demo we log the booking server-side so it's visible in the
     terminal during a pitch. */
  console.log(
    `[reservation] ${reference} — ${name}, ${phone}, ${date} ${time}, party of ${party}` +
      (body.note?.trim() ? ` — "${body.note.trim()}"` : "")
  );

  return NextResponse.json({ ok: true, reference });
}
