"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { motion } from "framer-motion";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import landAtlas from "world-atlas/land-50m.json";
import { TripIcon } from "@/components/TripIcon";
import type { Trip } from "@/data/trips";
import type { Feature, Geometry } from "geojson";
import type { Topology } from "topojson-specification";
import { useEffect, useMemo, useRef, useState } from "react";

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
  lastX: number;
  lastY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  view: ViewState;
};

type PinchState = {
  distance: number;
  mapX: number;
  mapY: number;
  view: ViewState;
};

type ViewportSize = {
  width: number;
  height: number;
};

type ProjectedMap = {
  projection: ReturnType<typeof geoNaturalEarth1>;
  path: string;
  worldWidth: number;
  top: number;
  bottom: number;
  edgePadding: number;
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

type MapPlanePosition = {
  x: number;
  y: number;
  angle: number;
};

type MapPlaneTarget = {
  x: number;
  y: number;
  speed: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 14;
const WORLD_COPIES = [-1, 0, 1, 2];
const MOBILE_WIDTH = 700;

const mapStickerShapeClasses = {
  square: "h-7 w-7 sm:h-10 sm:w-10 lg:h-12 lg:w-12",
  portrait: "h-8 w-6 sm:h-12 sm:w-10 lg:h-14 lg:w-11",
  landscape: "h-7 w-9 sm:h-10 sm:w-14 lg:h-12 lg:w-16",
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

function wrapMapX(x: number, width: number) {
  if (width <= 0) {
    return x;
  }

  return ((x % width) + width) % width;
}

function clampMapY(
  y: number,
  scale: number,
  viewportHeight: number,
  mapTop: number,
  mapBottom: number,
  edgePadding = 0,
) {
  const minY = viewportHeight - mapBottom * scale + edgePadding;
  const maxY = -mapTop * scale - edgePadding;

  if (minY > maxY) {
    return (minY + maxY) / 2;
  }

  return clamp(y, minY, maxY);
}

function stickerImageSrc(trip: Trip) {
  if (!trip.sticker.src) {
    return "";
  }

  return trip.sticker.version
    ? `${trip.sticker.src}?v=${encodeURIComponent(trip.sticker.version)}`
    : trip.sticker.src;
}

function distanceBetween(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function centerBetween(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

export function WorldStickerMap({ trips }: WorldStickerMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const latestViewRef = useRef<ViewState>({ scale: 1, x: 0, y: 0 });
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<PinchState | null>(null);
  const hasInitializedViewRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const didDragRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const pendingViewRef = useRef<ViewState | null>(null);
  const viewAnimationRef = useRef<number | null>(null);
  const inertiaAnimationRef = useRef<number | null>(null);
  const inertiaVelocityRef = useRef({ x: 0, y: 0 });
  const planeAnimationRef = useRef<number | null>(null);
  const isPlanePausedRef = useRef(false);
  const planePauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const planeCurrentRef = useRef({ x: 80, y: 80 });
  const planeTargetRef = useRef<MapPlaneTarget>({ x: 420, y: 220, speed: 90 });
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 });
  const [isPlanePaused, setIsPlanePaused] = useState(false);
  const [mapPlane, setMapPlane] = useState<MapPlanePosition>({
    x: 80,
    y: 80,
    angle: -25,
  });
  const [size, setSize] = useState<ViewportSize>({
    width: 1200,
    height: 720,
  });

  useEffect(() => {
    latestViewRef.current = view;
  }, [view]);

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
      if (viewAnimationRef.current) {
        cancelAnimationFrame(viewAnimationRef.current);
      }

      if (inertiaAnimationRef.current) {
        cancelAnimationFrame(inertiaAnimationRef.current);
      }

      if (planeAnimationRef.current) {
        cancelAnimationFrame(planeAnimationRef.current);
      }

      if (planePauseTimeoutRef.current) {
        clearTimeout(planePauseTimeoutRef.current);
      }
    };
  }, []);

  const applyView = (nextView: ViewState) => {
    latestViewRef.current = nextView;
    pendingViewRef.current = nextView;

    if (viewAnimationRef.current) {
      return;
    }

    viewAnimationRef.current = requestAnimationFrame(() => {
      viewAnimationRef.current = null;

      const pendingView = pendingViewRef.current;

      if (!pendingView) {
        return;
      }

      pendingViewRef.current = null;
      setView(pendingView);
    });
  };

  const map = useMemo<ProjectedMap>(() => {
    const isMobile = size.width < MOBILE_WIDTH;
    const fittedHeight = isMobile ? size.height * 1.62 : size.height;
    const verticalBleed = Math.max((fittedHeight - size.height) / 2, 0);
    const projection = geoNaturalEarth1().fitHeight(fittedHeight, landFeature);
    const path = geoPath(projection);
    const bounds = path.bounds(landFeature);
    const worldWidth = bounds[1][0] - bounds[0][0];
    const [translateX, translateY] = projection.translate();

    projection.translate([
      translateX + (size.width - worldWidth) / 2 - bounds[0][0],
      translateY - bounds[0][1] - verticalBleed,
    ]);

    const fittedBounds = path.bounds(landFeature);

    return {
      projection,
      path: path(landFeature) ?? "",
      worldWidth: fittedBounds[1][0] - fittedBounds[0][0],
      top: fittedBounds[0][1],
      bottom: fittedBounds[1][1],
      edgePadding: isMobile ? 38 : 0,
    };
  }, [size.height, size.width]);

  const preferredView = useMemo(() => {
    if (size.width >= MOBILE_WIDTH) {
      return {
        scale: 1,
        x: 0,
        y: clampMapY(0, 1, size.height, map.top, map.bottom, map.edgePadding),
      };
    }

    const projectedTrips = trips
      .map((trip) => map.projection([trip.mapPoint.lng, trip.mapPoint.lat]))
      .filter((point): point is [number, number] => Boolean(point));

    if (!projectedTrips.length) {
      return {
        scale: 1,
        x: 0,
        y: clampMapY(0, 1, size.height, map.top, map.bottom, map.edgePadding),
      };
    }

    const averageX =
      projectedTrips.reduce((total, point) => total + point[0], 0) /
      projectedTrips.length;
    const averageY =
      projectedTrips.reduce((total, point) => total + point[1], 0) /
      projectedTrips.length;
    const scale = size.width < 480 ? 1.08 : 1.04;

    return {
      scale,
      x: wrapX(size.width / 2 - averageX * scale, scale, map.worldWidth),
      y: clampMapY(
        size.height / 2 - averageY * scale,
        scale,
        size.height,
        map.top,
        map.bottom,
        map.edgePadding,
      ),
    };
  }, [map, size.height, size.width, trips]);

  useEffect(() => {
    if (hasInitializedViewRef.current || hasInteractedRef.current) {
      return;
    }

    latestViewRef.current = preferredView;
    setView(preferredView);
    hasInitializedViewRef.current = true;
  }, [preferredView]);

  const stopInertia = () => {
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current);
      inertiaAnimationRef.current = null;
    }

    inertiaVelocityRef.current = { x: 0, y: 0 };
  };

  const startInertia = (velocityX: number, velocityY: number) => {
    stopInertia();

    const initialSpeed = Math.hypot(velocityX, velocityY);

    if (initialSpeed < 80) {
      return;
    }

    inertiaVelocityRef.current = {
      x: clamp(velocityX, -1900, 1900),
      y: clamp(velocityY, -1900, 1900),
    };

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const velocity = inertiaVelocityRef.current;

      const current = latestViewRef.current;

      const rawY = current.y + velocity.y * dt;
      const nextY = clampMapY(
        rawY,
        current.scale,
        size.height,
        map.top,
        map.bottom,
        map.edgePadding,
      );

      applyView({
        ...current,
        x: wrapX(
          current.x + velocity.x * dt,
          current.scale,
          map.worldWidth,
        ),
        y: nextY,
      });

      const decay = Math.exp(-1.65 * dt);
      const nextVelocity = {
        x: velocity.x * decay,
        y: Math.abs(nextY - rawY) > 0.5 ? 0 : velocity.y * decay,
      };

      inertiaVelocityRef.current = nextVelocity;

      if (Math.hypot(nextVelocity.x, nextVelocity.y) < 12) {
        stopInertia();
        return;
      }

      inertiaAnimationRef.current = requestAnimationFrame(tick);
    };

    inertiaAnimationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pickTarget = (): MapPlaneTarget => ({
      x: Math.random() * map.worldWidth,
      y: 34 + Math.random() * Math.max(size.height - 68, 1),
      speed: prefersReducedMotion
        ? 14 + Math.random() * 18
        : 48 + Math.random() * 95,
    });

    planeCurrentRef.current = {
      x: wrapMapX(planeCurrentRef.current.x, map.worldWidth),
      y: clamp(planeCurrentRef.current.y, 24, size.height - 24),
    };
    planeTargetRef.current = pickTarget();

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isPlanePausedRef.current) {
        planeAnimationRef.current = requestAnimationFrame(tick);
        return;
      }

      const current = planeCurrentRef.current;
      const target = planeTargetRef.current;
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 4) {
        planeCurrentRef.current = {
          ...current,
          x: wrapMapX(current.x, map.worldWidth),
        };
        planeTargetRef.current = pickTarget();
      } else {
        const step = Math.min(target.speed * dt, distance);
        const next = {
          x: current.x + (dx / distance) * step,
          y: current.y + (dy / distance) * step,
        };
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 45;

        planeCurrentRef.current = next;
        setMapPlane({ ...next, angle });
      }

      planeAnimationRef.current = requestAnimationFrame(tick);
    };

    planeAnimationRef.current = requestAnimationFrame(tick);

    return () => {
      if (planeAnimationRef.current) {
        cancelAnimationFrame(planeAnimationRef.current);
      }
    };
  }, [map.worldWidth, size.height]);

  const zoomAt = (nextScale: number, originX?: number, originY?: number) => {
    hasInteractedRef.current = true;
    stopInertia();

    setView((current) => {
      const centerX = originX ?? size.width / 2;
      const centerY = originY ?? size.height / 2;
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const factor = scale / current.scale;

      const nextX = centerX - (centerX - current.x) * factor;
      const nextY = centerY - (centerY - current.y) * factor;

      const nextView = {
        scale,
        x: wrapX(nextX, scale, map.worldWidth),
        y: clampMapY(
          nextY,
          scale,
          size.height,
          map.top,
          map.bottom,
          map.edgePadding,
        ),
      };

      latestViewRef.current = nextView;
      return nextView;
    });
  };

  const setPlanePaused = (paused: boolean) => {
    if (planePauseTimeoutRef.current) {
      clearTimeout(planePauseTimeoutRef.current);
      planePauseTimeoutRef.current = null;
    }

    isPlanePausedRef.current = paused;
    setIsPlanePaused(paused);
  };

  const clearDragGuardSoon = () => {
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 120);
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
      className="relative h-full w-full touch-none overflow-hidden overscroll-none outline-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
      onClickCapture={(event) => {
        if (!didDragRef.current) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        didDragRef.current = false;
      }}
      onWheel={(event) => {
        event.preventDefault();
        hasInteractedRef.current = true;
        const bounds = event.currentTarget.getBoundingClientRect();
        const zoomIntensity = event.deltaY > 0 ? 0.86 : 1.16;

        zoomAt(
          view.scale * zoomIntensity,
          event.clientX - bounds.left,
          event.clientY - bounds.top,
        );
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        hasInteractedRef.current = true;
        didDragRef.current = false;
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
        stopInertia();
        event.currentTarget.setPointerCapture(event.pointerId);
        activePointersRef.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });

        const activePointers = Array.from(activePointersRef.current.values());

        if (activePointers.length >= 2) {
          const [first, second] = activePointers;
          const center = centerBetween(first, second);
          const bounds = event.currentTarget.getBoundingClientRect();
          const centerX = center.x - bounds.left;
          const centerY = center.y - bounds.top;
          const currentView = latestViewRef.current;

          pinchRef.current = {
            distance: distanceBetween(first, second),
            mapX: (centerX - currentView.x) / currentView.scale,
            mapY: (centerY - currentView.y) / currentView.scale,
            view: currentView,
          };
          dragRef.current = null;
        } else {
          pinchRef.current = null;
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastY: event.clientY,
            lastTime: performance.now(),
            velocityX: 0,
            velocityY: 0,
            view: latestViewRef.current,
          };
        }
      }}
      onPointerMove={(event) => {
        if (activePointersRef.current.has(event.pointerId)) {
          event.preventDefault();
          activePointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
          });
        }

        const activePointers = Array.from(activePointersRef.current.values());
        const pinch = pinchRef.current;

        if (pinch && activePointers.length >= 2) {
          const [first, second] = activePointers;
          const bounds = event.currentTarget.getBoundingClientRect();
          const center = centerBetween(first, second);
          const centerX = center.x - bounds.left;
          const centerY = center.y - bounds.top;
          const scale = clamp(
            pinch.view.scale *
              (distanceBetween(first, second) / Math.max(pinch.distance, 1)),
            MIN_SCALE,
            MAX_SCALE,
          );

          applyView({
            scale,
            x: wrapX(centerX - pinch.mapX * scale, scale, map.worldWidth),
            y: clampMapY(
              centerY - pinch.mapY * scale,
              scale,
              size.height,
              map.top,
              map.bottom,
              map.edgePadding,
            ),
          });
          didDragRef.current = true;
          return;
        }

        const drag = dragRef.current;

        if (!drag || drag.pointerId !== event.pointerId) {
          return;
        }

        const now = performance.now();
        const dt = Math.max((now - drag.lastTime) / 1000, 0.001);
        const totalDistance = Math.hypot(
          event.clientX - pointerStartRef.current.x,
          event.clientY - pointerStartRef.current.y,
        );

        if (totalDistance > 5) {
          didDragRef.current = true;
        }

        const instantVelocityX = (event.clientX - drag.lastX) / dt;
        const instantVelocityY = (event.clientY - drag.lastY) / dt;
        drag.velocityX = drag.velocityX * 0.62 + instantVelocityX * 0.38;
        drag.velocityY = drag.velocityY * 0.62 + instantVelocityY * 0.38;
        drag.lastX = event.clientX;
        drag.lastY = event.clientY;
        drag.lastTime = now;

        applyView({
          ...drag.view,
          x: wrapX(
            drag.view.x + event.clientX - drag.startX,
            drag.view.scale,
            map.worldWidth,
          ),
          y: clampMapY(
            drag.view.y + event.clientY - drag.startY,
            drag.view.scale,
            size.height,
            map.top,
            map.bottom,
            map.edgePadding,
          ),
        });
      }}
      onPointerUp={(event) => {
        activePointersRef.current.delete(event.pointerId);

        if (activePointersRef.current.size < 2) {
          pinchRef.current = null;
        }

        if (activePointersRef.current.size === 1) {
          const [remainingPointerId, remainingPointer] = Array.from(
            activePointersRef.current.entries(),
          )[0];

          dragRef.current = {
            pointerId: remainingPointerId,
            startX: remainingPointer.x,
            startY: remainingPointer.y,
            lastX: remainingPointer.x,
            lastY: remainingPointer.y,
            lastTime: performance.now(),
            velocityX: 0,
            velocityY: 0,
            view: latestViewRef.current,
          };
        } else if (dragRef.current?.pointerId === event.pointerId) {
          startInertia(dragRef.current.velocityX, dragRef.current.velocityY);
          dragRef.current = null;
        }

        if (didDragRef.current) {
          clearDragGuardSoon();
        }
      }}
      onPointerCancel={() => {
        activePointersRef.current.clear();
        pinchRef.current = null;
        dragRef.current = null;
        didDragRef.current = false;
        stopInertia();
      }}
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${size.width} ${size.height}`}
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {WORLD_COPIES.map((copy) => (
          <g
            key={copy}
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
          </g>
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
            aria-label={`open ${trip.title.toLowerCase()} trip`}
          className="absolute z-10 flex items-center justify-center p-2"
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
                trip.sticker.rotation - 7,
                trip.sticker.rotation + 7,
                trip.sticker.rotation,
              ],
              transition: {
                y: { duration: 0.12, ease: "easeOut" },
                scale: { duration: 0.12, ease: "easeOut" },
                rotate: {
                  duration: 0.28,
                  ease: "easeInOut",
                  times: [0, 0.38, 0.76, 1],
                },
              },
            }}
            whileTap={{
              y: -5,
              scale: 1.24,
              rotate: [
                trip.sticker.rotation,
                trip.sticker.rotation + 10,
                trip.sticker.rotation - 8,
                trip.sticker.rotation,
              ],
              transition: {
                scale: { duration: 0.1, ease: "easeOut" },
                y: { duration: 0.1, ease: "easeOut" },
                rotate: {
                  duration: 0.18,
                  ease: "easeInOut",
                  times: [0, 0.35, 0.72, 1],
                },
              },
            }}
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

      {WORLD_COPIES.map((copy) => {
        const x = view.x + (mapPlane.x + copy * map.worldWidth) * view.scale;
        const y = view.y + mapPlane.y * view.scale;

        if (
          x < -48 ||
          x > size.width + 48 ||
          y < -48 ||
          y > size.height + 48
        ) {
          return null;
        }

        return (
          <Link
            key={`plane-${copy}`}
            href="/stats"
            aria-label="open stats"
            className="group absolute z-30 flex h-10 w-10 items-center justify-center text-[#343230] outline-none focus-visible:ring-2 focus-visible:ring-[#d7c8b7] sm:h-12 sm:w-12"
            onBlur={() => {
              setPlanePaused(false);
            }}
            onFocus={() => {
              setPlanePaused(true);
            }}
            onMouseEnter={() => {
              setPlanePaused(true);
            }}
            onMouseLeave={() => {
              planePauseTimeoutRef.current = setTimeout(() => {
                setPlanePaused(false);
              }, 180);
            }}
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.span
              animate={{
                y: isPlanePaused ? [0, -4, 1, -3, 0] : [0, -3, 0],
                x: isPlanePaused ? [0, 2, -1, 1, 0] : 0,
                rotate: isPlanePaused
                  ? [
                      mapPlane.angle,
                      mapPlane.angle - 10,
                      mapPlane.angle + 8,
                      mapPlane.angle,
                    ]
                  : mapPlane.angle,
                scale: isPlanePaused ? 1.12 : 1,
              }}
              whileHover={{
                y: [0, -5, -1, -5, 0],
                x: [0, 2, -1, 2, 0],
                scale: 1.12,
                rotate: [
                  mapPlane.angle,
                  mapPlane.angle - 10,
                  mapPlane.angle + 8,
                  mapPlane.angle,
                ],
                transition: { duration: 0.36, ease: "easeInOut" },
              }}
              whileTap={{
                scale: 1.2,
                transition: { duration: 0.1, ease: "easeOut" },
              }}
              transition={{
                y: {
                  duration: isPlanePaused ? 0.42 : 2.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x: {
                  duration: 0.42,
                  repeat: isPlanePaused ? Infinity : 0,
                  ease: "easeInOut",
                },
                rotate: { duration: 0.2, ease: "easeOut" },
                scale: { duration: 0.12, ease: "easeOut" },
              }}
              className="flex"
            >
              <Plane className="h-4 w-4 fill-[#343230] stroke-[#343230] sm:h-5 sm:w-5" />
            </motion.span>
          </Link>
        );
      })}

    </div>
  );
}
