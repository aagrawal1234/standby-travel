import { FadeIn } from "@/components/FadeIn";
import { WorldStickerMap } from "@/components/WorldStickerMap";
import { trips } from "@/data/trips";

export default function Home() {
  const visibleTrips = trips.filter((trip) => trip.sticker.visible);

  return (
    <FadeIn className="fixed inset-0 h-dvh w-screen overflow-hidden bg-background">
      <main className="h-full w-full">
        <WorldStickerMap trips={visibleTrips} />
      </main>
    </FadeIn>
  );
}
