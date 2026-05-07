import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { PlaneButton } from "@/components/PlaneButton";
import { TripIcon } from "@/components/TripIcon";
import { TripMediaWall } from "@/components/TripMediaWall";
import type { TripMedia } from "@/components/TripMediaWall";
import type { TripImage } from "@/data/trips";
import { tripMedia } from "@/data/trip-media.generated";
import { getTripBySlug, trips } from "@/data/trips";

export const dynamicParams = false;

export function generateStaticParams() {
  return trips.map((trip) => ({ slug: trip.slug }));
}

const detailStickerShapeClasses = {
  square: "h-32 w-32 sm:h-40 sm:w-40",
  portrait: "h-40 w-32 sm:h-48 sm:w-40",
  landscape: "h-32 w-44 sm:h-40 sm:w-56",
};

function fallbackMedia(images: TripImage[]): TripMedia[] {
  return images.map((image) => ({
    type: "image",
    src: image.src,
    alt: image.alt,
  }));
}

function getTripMedia(slug: string, fallbackImages: TripImage[]) {
  const media = tripMedia[slug] ?? [];
  return media.length ? media : fallbackMedia(fallbackImages);
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  const stickerSrc =
    trip.sticker.src && trip.sticker.version
      ? `${trip.sticker.src}?v=${encodeURIComponent(trip.sticker.version)}`
      : trip.sticker.src;
  const media = getTripMedia(trip.slug, trip.images);
  const vlogHref = trip.vlogLinks[0]?.href ?? "#";

  return (
    <FadeIn className="relative min-h-dvh overflow-hidden px-5 py-20 sm:px-8">
      <PlaneButton href="/" variant="back" ariaLabel="back home" />

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center">
        <div className="flex flex-col items-center text-center">
          {stickerSrc ? (
            <div
              className={`relative mb-5 ${detailStickerShapeClasses[trip.sticker.shape]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stickerSrc}
                alt={trip.sticker.alt}
                className="h-full w-full object-contain drop-shadow-[0_22px_34px_rgba(65,55,43,0.18)]"
              />
            </div>
          ) : (
            <TripIcon
              iconType={trip.iconType}
              className="mb-3 h-24 w-40 sm:h-28 sm:w-48"
            />
          )}
          <h1 className="text-3xl font-semibold text-[#2d2b27] sm:text-4xl">
            {trip.title.toLowerCase()}!
          </h1>
          <p className="mt-2 text-sm text-[#817b72]">
            {trip.date.toLowerCase()}
          </p>
        </div>

        <TripMediaWall media={media} />

        <a
          href={vlogHref}
          target={vlogHref === "#" ? undefined : "_blank"}
          rel={vlogHref === "#" ? undefined : "noreferrer"}
          className="mt-12 inline-flex items-center gap-1.5 text-sm font-medium text-[#6f675e] transition-colors hover:text-[#2d2b27]"
        >
          <span>vlog link</span>
          <ExternalLink className="h-3.5 w-3.5 text-[#a49a8d]" />
        </a>
      </main>
    </FadeIn>
  );
}
