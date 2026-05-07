import { FadeIn } from "@/components/FadeIn";
import { PlaneButton } from "@/components/PlaneButton";
import { TravelGlobe } from "@/components/TravelGlobe";

export default function StatsPage() {
  return (
    <FadeIn className="relative min-h-dvh overflow-hidden px-5 py-20 sm:px-8">
      <PlaneButton href="/" variant="back" ariaLabel="back home" />

      <main className="mx-auto flex min-h-[calc(100dvh-10rem)] w-full items-center justify-center">
        <TravelGlobe />
      </main>
    </FadeIn>
  );
}
