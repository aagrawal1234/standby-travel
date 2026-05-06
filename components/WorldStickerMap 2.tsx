"use client";

import Link from "next/link";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import landAtlas from "world-atlas/land-50m.json";
import { TripIcon } from "@/components/TripIcon";
import type { Trip } from "@/data/trips";
import type { Feature, Geometry } from "geojson";
import type { Topology } from "topojson-specification";
import { useRef, useState } from "react";

type WorldStickerMapProps = {
  trips: Trip[];
};

type ViewState = {
  scale: number;
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  view: ViewState;
};

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 520;
const MIN_SCALE = 1;
const MAX_SCALE = 4.2;

const mapStickerShapeClasses = {
  square: "h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20",
  portrait: "h-14 w-12 sm:h-20 sm:w-16 lg:h-24 lg:w-20",
  landscape: "h-12 w-16 sm:h-16 sm:w-[5.5rem] lg:h-20 lg:w-28",
};

const landFeature = feature(
  landAtlas as unknown as Topology,
  (landAtlas as unknown as Topology).objects.land,
) as Feature<Geometry>;

const projection = geoNaturalEarth1().fitExtent(
  [
    [22, 24],
    [MAP_WIDTH - 22, MAP_HEIGHT - 24],
  ],
  landFeature,
);

const landPath = geoPath(projection)(landFeature) ?? "";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function projectTrip(trip: Trip) {
  const projected = projection([trip.mapPoint.lng, trip.mapPoint.lat]);

  if (!projected) {
    return { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
  }

  return {
    x: projected[0],
    y: projected[1],
  };
}

function stickerImageSrc(trip: Trip) {
  if (!trip.sticker.src) {
    return "";
  }

  return trip.sticker.version
    ? `${trip.sticker.src}?v=${encodeURIComponent(trip.sticker.version)}`
    : trip.sticker.src;
}

export function WorldStickerMap({ trips }: WorldStickerMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 });

  const zoomAt = (nextScale: number, originX?: number, originY?: number) => {
    setView((current) => {
      const viewport = viewportRef.current?.getBoundingClientRect();
      const centerX = originX ?? (viewport?.width ?? 0) / 2;
      const centerY = originY ?? (viewport?.height ?? 0) / 2;
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const factor = scale / current.scale;

      return {
        scale,
        x: centerX - (centerX - current.x) * factor,
        y: centerY - (centerY - current.y) * factor,
      };
    });
  };

  return (
    <div className="w-full py-8">
      <div
        ref={viewportRef}
        className="relative mx-auto aspect-[1.92/1] max-h-[78dvh] min-h-[390px] w-full max-w-6xl overflow-hidden rounded-[2rem] outline-none"
        onWheel={(event) => {
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          const zoomIntensity = event.deltaY > 0 ? 0.86 : 1.16;

          zoomAt(
            view.scale * zoomIntensity,
            event.clientX - bounds.left,
            event.clientY - bounds.top,
          );
        }}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("a,button")) {
            return;
          }

          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            view,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;

          if (!drag || drag.pointerId !== event.pointerId) {
            return;
          }

          setView({
            ...drag.view,
            x: drag.view.x + event.clientX - drag.startX,
            y: drag.view.y + event.clientY - drag.startY,
          });
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId === event.pointerId) {
            dragRef.current = null;
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px)) scale(${view.scale})`,
            transformOrigin: "center",
          }}
        >
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            <motion.path
              d={landPath}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              fill="rgba(255,255,255,0.08)"
              stroke="#c5b59f"
              strokeWidth="1.15"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {trips.map((trip, index) => {
            const point = projectTrip(trip);
            const src = stickerImageSrc(trip);
            const offsetX = trip.mapPoint.offsetX ?? 0;
            const offsetY = trip.mapPoint.offsetY ?? 0;

            return (
              <Link
                key={trip.slug}
                href={`/trips/${trip.slug}`}
                aria-label={`Open ${trip.title} trip`}
                className="absolute z-10"
                style={{
                  left: point.x + offsetX,
                  top: point.y + offsetY,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                    rotate: trip.sticker.rotation,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: trip.sticker.rotation,
                  }}
                  transition={{
                    delay: index * 0.035,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    y: -7,
                    scale: 1.08,
                    rotate: [
                      trip.sticker.rotation,
                      trip.sticker.rotation - 5,
                      trip.sticker.rotation + 5,
                      trip.sticker.rotation,
                    ],
                  }}
                  whileTap={{ scale: 0.96 }}
                  className={`group relative ${mapStickerShapeClasses[trip.sticker.shape]}`}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={trip.sticker.alt}
                      draggable={false}
                      className="h-full w-full select-none object-contain drop-shadow-[0_18px_24px_rgba(65,55,43,0.2)]"
                    />
                  ) : (
                    <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-white bg-white/60 shadow-[0_18px_28px_rgba(65,55,43,0.13)]">
                      <TripIcon
                        iconType={trip.iconType}
                        className="h-full w-full scale-[1.35]"
                      />
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 rounded-full border border-[#ded0bd]/70 bg-white/35 p-1 shadow-[0_10px_24px_rgba(65,55,43,0.08)] backdrop-blur-md">
          <button
            type="button"
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#4f4941] transition-colors hover:bg-white/55"
            onClick={() => zoomAt(view.scale * 0.78)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Reset map"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#4f4941] transition-colors hover:bg-white/55"
            onClick={() => setView({ scale: 1, x: 0, y: 0 })}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#4f4941] transition-colors hover:bg-white/55"
            onClick={() => zoomAt(view.scale * 1.28)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
