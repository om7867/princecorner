import type { Metadata } from "next";
import { ReservationsList } from "@/components/admin/ReservationsList";

export const metadata: Metadata = { title: "Reservations — Admin" };

export default function AdminReservationsPage() {
  return <ReservationsList />;
}
