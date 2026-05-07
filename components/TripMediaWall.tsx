"use client";

import { motion } from "framer-motion";
import { AutoLoopVideo } from "@/components/AutoLoopVideo";

export type TripMedia = {
  type: "image" | "video";
  src: string;
  alt: string;
};

type TripMediaWallProps = {
  media: TripMedia[];
};

const rotations = [-1.8, 1.2, -0.7, 1.7, -1.1, 0.8, -1.5, 1.4];
const widthClasses = [
  "sm:w-[92%]",
  "sm:w-[78%]",
  "sm:w-full",
  "sm:w-[86%]",
  "sm:w-[72%]",
  "sm:w-[94%]",
];
const alignmentClasses = [
  "sm:ml-0 sm:mr-auto",
  "sm:ml-auto sm:mr-0",
  "sm:mx-auto",
  "sm:ml-[8%] sm:mr-auto",
  "sm:ml-auto sm:mr-[6%]",
  "sm:mx-auto",
];
const spacingClasses = ["mb-5", "mb-10", "mb-6", "mb-14", "mb-7", "mb-11"];

export function TripMediaWall({ media }: TripMediaWallProps) {
  return (
    <div className="mt-14 w-full max-w-6xl columns-1 gap-7 sm:columns-2 lg:columns-3">
      {media.map((item, index) => {
        const rotation = rotations[index % rotations.length];
        const widthClass = widthClasses[index % widthClasses.length];
        const alignmentClass = alignmentClasses[index % alignmentClasses.length];
        const spacingClass = spacingClasses[index % spacingClasses.length];

        return (
          <motion.figure
            key={`${item.src || item.alt}-${index}`}
            aria-label={item.alt}
            className={`break-inside-avoid overflow-visible ${spacingClass} ${widthClass} ${alignmentClass}`}
            initial={{ opacity: 0, y: 16, rotate: rotation }}
            whileInView={{ opacity: 1, y: 0, rotate: rotation }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            whileHover={{
              y: -8,
              rotate: 0,
              scale: 1.015,
              transition: { duration: 0.22, ease: "easeOut" },
            }}
          >
            {item.src && item.type === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                className="h-auto w-full select-none object-contain shadow-[0_20px_42px_rgba(76,67,54,0.1)]"
                loading={index === 0 ? "eager" : "lazy"}
              />
            )}
            {item.src && item.type === "video" && (
              <AutoLoopVideo
                src={item.src}
                label={item.alt}
                eager={index === 0}
                className="h-auto w-full shadow-[0_20px_42px_rgba(76,67,54,0.1)]"
              />
            )}
            {!item.src && (
              <span className="block bg-[#f7f0e7]/70 px-4 py-14 text-xs font-medium text-[#a1998f] shadow-[0_20px_42px_rgba(76,67,54,0.06)]">
                media {index + 1}
              </span>
            )}
          </motion.figure>
        );
      })}
    </div>
  );
}
