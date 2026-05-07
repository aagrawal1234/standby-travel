"use client";

import Link from "next/link";
import { ArrowLeft, Plane } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type PlaneButtonProps = {
  href: string;
  ariaLabel: string;
  variant?: "plane" | "back";
};

type PlanePosition = {
  x: number;
  y: number;
  angle: number;
};

type TrailPoint = {
  id: number;
  x: number;
  y: number;
  createdAt: number;
};

type PlaneTarget = {
  x: number;
  y: number;
  speed: number;
};

type FlyToPlaneEvent = CustomEvent<{
  x: number;
  y: number;
  duration?: number;
}>;

const TRAIL_LIFETIME = 2600;
const FLY_TO_PLANE_EVENT = "standby-travel:fly-plane-to";

export function PlaneButton({
  href,
  ariaLabel,
  variant = "plane",
}: PlaneButtonProps) {
  const isPlane = variant === "plane";

  if (!isPlane) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className="group fixed left-5 top-5 z-20 flex h-10 w-10 items-center justify-center text-[#343230] outline-none focus-visible:ring-2 focus-visible:ring-[#d7c8b7] sm:left-7 sm:top-7"
      >
        <motion.span
          whileHover={{
            x: [-1, -5, -2, -5, -1],
            y: [0, -1, 1, -1, 0],
            rotate: [0, -8, 6, -5, 0],
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
          whileTap={{
            x: -6,
            scale: 1.18,
            rotate: -10,
            transition: { duration: 0.1, ease: "easeOut" },
          }}
          className="flex"
        >
          <ArrowLeft className="h-5 w-5 stroke-[1.8]" />
        </motion.span>
      </Link>
    );
  }

  return <FlyingPlaneButton href={href} ariaLabel={ariaLabel} />;
}

function FlyingPlaneButton({
  href,
  ariaLabel,
}: Pick<PlaneButtonProps, "href" | "ariaLabel">) {
  const [plane, setPlane] = useState<PlanePosition>({
    x: 28,
    y: 28,
    angle: -25,
  });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const animationRef = useRef<number | null>(null);
  const trailIdRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const margin = 28;
    const buttonSize = 48;
    const pickTarget = (): PlaneTarget => ({
      x:
        margin +
        Math.random() *
          Math.max(window.innerWidth - buttonSize - margin * 2, 1),
      y:
        margin +
        Math.random() *
          Math.max(window.innerHeight - buttonSize - margin * 2, 1),
      speed: 45 + Math.random() * 100,
    });

    let current = { x: 28, y: 28 };
    let target: PlaneTarget = pickTarget();
    let lastTime = performance.now();
    let lastTrailTime = 0;

    const handleFlyTo = (event: Event) => {
      const { x, y, duration = 720 } = (event as FlyToPlaneEvent).detail;
      const nextX = clamp(x - buttonSize / 2, 0, window.innerWidth - buttonSize);
      const nextY = clamp(y - buttonSize / 2, 0, window.innerHeight - buttonSize);
      const distance = Math.hypot(nextX - current.x, nextY - current.y);

      target = {
        x: nextX,
        y: nextY,
        speed: Math.max(distance / (duration / 1000), 520),
      };
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 4) {
        target = pickTarget();
      } else {
        const step = Math.min(target.speed * dt, distance);
        current = {
          x: current.x + (dx / distance) * step,
          y: current.y + (dy / distance) * step,
        };

        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 45;
        setPlane({ x: current.x, y: current.y, angle });

        if (now - lastTrailTime > 105) {
          lastTrailTime = now;
          const point = {
            id: trailIdRef.current++,
            x: current.x + buttonSize / 2,
            y: current.y + buttonSize / 2,
            createdAt: now,
          };

          setTrail((points) =>
            [...points, point].filter(
              (trailPoint) => now - trailPoint.createdAt < TRAIL_LIFETIME,
            ),
          );
        }
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener(FLY_TO_PLANE_EVENT, handleFlyTo);
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener(FLY_TO_PLANE_EVENT, handleFlyTo);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10">
        {trail.map((point) => (
          <motion.span
            key={point.id}
            initial={{ opacity: 0.48, scale: 1 }}
            animate={{ opacity: 0, scale: 0.35 }}
            transition={{ duration: TRAIL_LIFETIME / 1000, ease: "easeOut" }}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#b9ac9c]"
            style={{
              left: point.x,
              top: point.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <Link
        href={href}
        aria-label={ariaLabel}
        className="group fixed z-20 flex h-12 w-12 items-center justify-center rounded-full text-[#343230] outline-none transition-colors hover:bg-white/60 focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-[#e2d7ca]"
        style={{
          left: plane.x,
          top: plane.y,
        }}
      >
        <motion.span
          animate={{ y: [0, -3, 0], rotate: plane.angle }}
          transition={{
            y: { duration: 2.3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 0.2, ease: "easeOut" },
          }}
          className="flex"
        >
          <Plane className="h-5 w-5 fill-[#343230] stroke-[#343230]" />
        </motion.span>
      </Link>
    </>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
