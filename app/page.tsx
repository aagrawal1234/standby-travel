import { WorldStickerMap } from "@/components/WorldStickerMap";
import { trips } from "@/data/trips";

export default function Home() {
  const visibleTrips = trips.filter((trip) => trip.sticker.visible);

  return (
    <div className="home-map-shell">
      <main className="h-full w-full">
        <WorldStickerMap trips={visibleTrips} />
      </main>
    </div>
  );
}
