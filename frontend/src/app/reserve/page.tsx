import type { Metadata } from "next";
import { ReserveFlow } from "./ReserveFlow";

export const metadata: Metadata = {
  title: "Reserve Your Table",
  description:
    "Pick a room, pick a night — the candles are lit by the time you arrive.",
};

export const dynamic = "force-dynamic";

export default function ReservePage() {
  return <ReserveFlow />;
}
