"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TripIcon } from "@/components/TripIcon";
import type { Trip } from "@/data/trips";

type TripCardProps = {
  trip: Trip;
};

const shapeClasses = {
  square: "h-24 w-24 sm:h-28 sm:w-28",
  portrait: "h-28 w-24 sm:h-32 sm:w-28",
  landscape: "h-24 w-32 sm:h-28 sm:w-36",
};

export function TripCard({ trip }: TripCardProps) {
  const { sticker } = trip;
  const rotation = sticker.rotation;
  const hasStickerImage = Boolean(sticker.src);
  const stickerSrc =
    hasStickerImage && sticker.version
      ? `${sticker.src}?v=${encodeURIComponent(sticker.version)}`
      : sticker.src;

  return (
    <Link
      href={`/trips/${trip.slug}`}
      aria-label={`Open ${trip.title} trip`}
      className="inline-flex justify-center"
    >
      <motion.article
        initial={{ opacity: 0, y: 8, rotate: rotation }}
        animate={{ opacity: 1, y: 0, rotate: rotation }}
        whileHover={{
          y: -7,
          rotate: [rotation, rotation - 4, rotation + 4, rotation - 2, rotation],
          scale: 1.04,
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        className="group relative"
      >
        {!hasStickerImage && sticker.accent === "tape" && (
          <span className="absolute left-1/2 top-0 z-10 h-4 w-12 -translate-x-1/2 -translate-y-2 rotate-[-6deg] rounded-[2px] bg-[#d8c7ad]/65 shadow-[0_3px_8px_rgba(76,67,54,0.08)] backdrop-blur-sm" />
        )}

        {!hasStickerImage && sticker.accent === "pin" && (
          <span className="absolute left-1/2 top-0 z-10 h-5 w-5 -translate-x-1/2 -translate-y-2 rounded-full border border-[#d5c8b7] bg-[#d8d0c2] shadow-[0_4px_9px_rgba(76,67,54,0.12)]" />
        )}

        <div
          className={`relative ${shapeClasses[sticker.shape]} ${
            hasStickerImage
              ? "overflow-visible"
              : "overflow-hidden rounded-[1.35rem] border-[5px] border-white bg-white shadow-[0_18px_35px_rgba(65,55,43,0.16)] transition-shadow group-hover:shadow-[0_22px_42px_rgba(65,55,43,0.18)]"
          }`}
        >
          {hasStickerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={stickerSrc}
              alt={sticker.alt}
              className="h-full w-full object-contain drop-shadow-[0_18px_24px_rgba(65,55,43,0.18)] transition-[filter] group-hover:drop-shadow-[0_22px_30px_rgba(65,55,43,0.2)]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_25%,#fff7ef_0%,#f0deca_78%)]">
              <TripIcon
                iconType={trip.iconType}
                className="h-full w-full scale-[1.35] opacity-95"
              />
            </div>
          )}

          {!hasStickerImage && (
            <div className="pointer-events-none absolute inset-0 rounded-[1rem] ring-1 ring-black/[0.03]" />
          )}
        </div>
      </motion.article>
    </Link>
  );
}
