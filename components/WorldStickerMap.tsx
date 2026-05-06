"use client";

import Link from "next/link";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import landAtlas from "world-atlas/land-50m.json";
import { TripIcon } from "@/components/TripIcon";
import type { Trip } from "@/data/trips";
import type { Feature, Geometry } from "geojson";
import type { Topology } from "topojson-specification";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";

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

type ViewportSize = {
  width: number;
  height: number;
};

type MapMarker = {
  trip: Trip;
  index: number;
  src: string;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  key: string;
  hasLeader: boolean;
};

type ClickPulse = {
  key: number;
  x: number;
  y: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 14;
const WORLD_COPIES = [-1, 0, 1, 2];
const FLY_TO_PLANE_EVENT = "standby-travel:fly-plane-to";

const mapStickerShapeClasses = {
  square: "h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12",
  portrait: "h-10 w-8 sm:h-12 sm:w-10 lg:h-14 lg:w-11",
  landscape: "h-8 w-11 sm:h-10 sm:w-14 lg:h-12 lg:w-16",
};

const landFeature = feature(
  landAtlas as unknown as Topology,
  (landAtlas as unknown as Topology).objects.land,
) as Feature<Geometry>;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function wrapX(x: number, scale: number, width: number) {
  const period = width * scale;

  if (period <= 0) {
    return x;
  }

  return ((((x % period) + period) % period) - period);
}

function clampY(y: number, scale: number, height: number) {
  if (scale <= 1) {
    return 0;
  }

  return clamp(y, height - height * scale, 0);
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
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pulseKeyRef = useRef(0);
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 });
  const [clickPulse, setClickPulse] = useState<ClickPulse | null>(null);
  const [size, setSize] = useState<ViewportSize>({
    width: 1200,
    height: 720,
  });

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(entry.contentRect.width, 1),
        height: Math.max(entry.contentRect.height, 1),
      });
    });

    observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const map = useMemo(() => {
    const projection = geoNaturalEarth1().fitHeight(size.height, landFeature);
    const path = geoPath(projection);
    const bounds = path.bounds(landFeature);
    const worldWidth = bounds[1][0] - bounds[0][0];
    const [translateX, translateY] = projection.translate();

    projection.translate([
      translateX + (size.width - worldWidth) / 2 - bounds[0][0],
      translateY - bounds[0][1],
    ]);

    const fittedBounds = path.bounds(landFeature);

    return {
      projection,
      path: path(landFeature) ?? "",
      worldWidth: fittedBounds[1][0] - fittedBounds[0][0],
    };
  }, [size.height, size.width]);

  const zoomAt = (nextScale: number, originX?: number, originY?: number) => {
    setView((current) => {
      const centerX = originX ?? size.width / 2;
      const centerY = originY ?? size.height / 2;
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const factor = scale / current.scale;

      const nextX = centerX - (centerX - current.x) * factor;
      const nextY = centerY - (centerY - current.y) * factor;

      return {
        scale,
        x: wrapX(nextX, scale, map.worldWidth),
        y: clampY(nextY, scale, size.height),
      };
    });
  };

  const handleMarkerClick = (
    event: MouseEvent<HTMLAnchorElement>,
    marker: MapMarker,
  ) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    setClickPulse({
      key: pulseKeyRef.current++,
      x: marker.x,
      y: marker.y,
    });
    window.dispatchEvent(
      new CustomEvent(FLY_TO_PLANE_EVENT, {
        detail: { x: marker.x, y: marker.y, duration: 620 },
      }),
    );

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      router.push(`/trips/${marker.trip.slug}`);
    }, 680);
  };

  const markers: MapMarker[] = trips.flatMap((trip, index) => {
    const point = map.projection([trip.mapPoint.lng, trip.mapPoint.lat]);
    const src = stickerImageSrc(trip);

    if (!point) {
      return [];
    }

    return WORLD_COPIES.flatMap((copy) => {
      const anchorX =
        view.x + copy * map.worldWidth * view.scale + point[0] * view.scale;
      const anchorY = view.y + point[1] * view.scale;
      const x = anchorX + (trip.mapPoint.offsetX ?? 0);
      const y = anchorY + (trip.mapPoint.offsetY ?? 0);

      if (
        x < -120 ||
        x > size.width + 120 ||
        y < -120 ||
        y > size.height + 120
      ) {
        return [];
      }

      return [
        {
          trip,
          index,
          src,
          x,
          y,
          anchorX,
          anchorY,
          key: `${trip.slug}-${copy}`,
          hasLeader:
            Math.hypot(
              trip.mapPoint.offsetX ?? 0,
              trip.mapPoint.offsetY ?? 0,
            ) > 4,
        },
      ];
    });
  });

  return (
    <div
      ref={viewportRef}
      className="relative h-dvh w-full touch-none overflow-hidden outline-none"
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
          x: wrapX(
            drag.view.x + event.clientX - drag.startX,
            drag.view.scale,
            map.worldWidth,
          ),
          y: clampY(
            drag.view.y + event.clientY - drag.startY,
            drag.view.scale,
            size.height,
          ),
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
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${size.width} ${size.height}`}
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {WORLD_COPIES.map((copy) => (
          <motion.g
            key={copy}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            transform={`matrix(${view.scale} 0 0 ${view.scale} ${
              view.x + copy * map.worldWidth * view.scale
            } ${view.y})`}
          >
            <path
              d={map.path}
              fill="rgba(255,255,255,0.08)"
              stroke="#c5b59f"
              strokeWidth="1.12"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </motion.g>
        ))}

        <g>
          {markers.map((marker) =>
            marker.hasLeader ? (
              <line
                key={`line-${marker.key}`}
                x1={marker.anchorX}
                y1={marker.anchorY}
                x2={marker.x}
                y2={marker.y}
                stroke="#a99b89"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="2 4"
                opacity="0.55"
              />
            ) : null,
          )}
        </g>
      </svg>

      {markers.map((marker) => {
        const { trip, index, src, x, y, key } = marker;

        return (
        <Link
          key={key}
          href={`/trips/${trip.slug}`}
          aria-label={`Open ${trip.title} trip`}
          className="absolute z-10"
          onClick={(event) => handleMarkerClick(event, marker)}
          style={{
            left: x,
            top: y,
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
              scale: 1.18,
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
                className="h-full w-full select-none object-contain drop-shadow-[0_12px_16px_rgba(65,55,43,0.18)]"
              />
            ) : (
              <div className="h-full w-full overflow-hidden rounded-xl border-[3px] border-white bg-white/60 shadow-[0_12px_18px_rgba(65,55,43,0.12)]">
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

      {clickPulse && (
        <motion.span
          key={clickPulse.key}
          aria-hidden="true"
          className="pointer-events-none absolute z-20 h-14 w-14 rounded-full border border-[#b7a995]/60 bg-white/10"
          initial={{
            x: clickPulse.x - 28,
            y: clickPulse.y - 28,
            opacity: 0.65,
            scale: 0.35,
          }}
          animate={{
            opacity: 0,
            scale: 1.8,
          }}
          transition={{ duration: 0.62, ease: "easeOut" }}
        />
      )}

      <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1 rounded-full border border-[#ded0bd]/70 bg-white/35 p-1 shadow-[0_10px_24px_rgba(65,55,43,0.08)] backdrop-blur-md">
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
  );
}
