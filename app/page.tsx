import { FadeIn } from "@/components/FadeIn";
import { WorldStickerMap } from "@/components/WorldStickerMap";
import { trips } from "@/data/trips";

export default function Home() {
  const visibleTrips = trips.filter((trip) => trip.sticker.visible);

  return (
    <FadeIn className="fixed inset-0 h-[100svh] min-h-[100dvh] overflow-hidden">
      <main className="h-full w-full">
        <WorldStickerMap trips={visibleTrips} />
      </main>
    </FadeIn>
  );
}
