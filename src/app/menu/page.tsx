import type { Metadata } from "next";
import { getAvailableMenu } from "@/server/store";
import { WorldCanvas } from "@/scenes/core/WorldCanvas";
import { MenuHubWorld, MENU_KEYFRAMES } from "@/scenes/worlds/MenuHubWorld";
import { MenuHub } from "./MenuHub";

export const metadata: Metadata = {
  title: "The Menu",
  description:
    "Every plate, pour, and pastry across all four Smaplee rooms — in one place.",
};

export const dynamic = "force-dynamic";

export default async function MenuHubPage() {
  const items = await getAvailableMenu();

  return (
    <>
      <WorldCanvas
        keyframes={MENU_KEYFRAMES}
        backdrop="bg-gradient-to-b from-[#1c1610] via-[#14100b] to-[#0e0b08]"
      >
        <MenuHubWorld />
      </WorldCanvas>
      <MenuHub items={items} />
    </>
  );
}
