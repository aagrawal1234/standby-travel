import { PlaneButton } from "@/components/PlaneButton";
import { FadeIn } from "@/components/FadeIn";
import { WorldStickerMap } from "@/components/WorldStickerMap";
import { trips } from "@/data/trips";

export default function Home() {
  const visibleTrips = trips.filter((trip) => trip.sticker.visible);

  return (
    <FadeIn className="relative min-h-dvh overflow-hidden">
      <PlaneButton href="/stats" ariaLabel="Open flight globe" />

      <main className="h-dvh w-full">
        <WorldStickerMap trips={visibleTrips} />
      </main>
    </FadeIn>
  );
}
