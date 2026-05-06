import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { PlaneButton } from "@/components/PlaneButton";
import { TripIcon } from "@/components/TripIcon";
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

  return (
    <FadeIn className="relative min-h-dvh overflow-hidden px-5 py-20 sm:px-8">
      <PlaneButton href="/" variant="back" ariaLabel="Back home" />

      <main className="mx-auto flex w-full max-w-4xl flex-col items-center">
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
            {trip.title}
          </h1>
          <p className="mt-2 text-sm text-[#817b72]">{trip.date}</p>
          <p className="mt-5 max-w-md text-sm leading-6 text-[#716b63]">
            {trip.description}
          </p>
        </div>

        <div className="mt-12 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {trip.images.map((image, index) => (
            <div
              key={`${image.alt}-${index}`}
              aria-label={image.alt}
              className={`flex min-h-32 items-end rounded-2xl border border-[#eee8dd] bg-[#f7f0e7] bg-cover bg-center p-4 shadow-[0_18px_45px_rgba(76,67,54,0.06)] ${
                index === 0 ? "col-span-2 min-h-56 sm:row-span-2" : ""
              } ${index === 3 ? "sm:col-span-2" : ""}`}
              style={
                image.src ? { backgroundImage: `url(${image.src})` } : undefined
              }
            >
              {!image.src && (
                <span className="text-xs font-medium text-[#a1998f]">
                  image {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 w-full max-w-xl">
          <p className="mb-3 text-center text-xs font-medium text-[#9a9288]">
            vlog links
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {trip.vlogLinks.map((link) => (
              <a
                key={link.title}
                href={link.href}
                target={link.href === "#" ? undefined : "_blank"}
                rel={link.href === "#" ? undefined : "noreferrer"}
                className="flex items-center justify-between rounded-2xl border border-[#eee8dd] bg-white/78 px-4 py-3 text-sm text-[#48443e] shadow-[0_16px_38px_rgba(76,67,54,0.06)] transition-colors hover:bg-white"
              >
                <span>{link.title}</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#a49a8d]" />
              </a>
            ))}
          </div>
        </div>
      </main>
    </FadeIn>
  );
}
