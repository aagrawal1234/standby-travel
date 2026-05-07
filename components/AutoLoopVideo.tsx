"use client";

import { useEffect, useRef } from "react";

type AutoLoopVideoProps = {
  src: string;
  label: string;
  eager?: boolean;
  className?: string;
};

export function AutoLoopVideo({
  src,
  label,
  eager = false,
  className,
}: AutoLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = () => {
      void video.play().catch(() => {
        // Browsers can still block autoplay for unsupported codecs or settings.
      });
    };

    playVideo();
    video.addEventListener("canplay", playVideo);
    video.addEventListener("loadeddata", playVideo);

    return () => {
      video.removeEventListener("canplay", playVideo);
      video.removeEventListener("loadeddata", playVideo);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      aria-label={label}
      autoPlay
      loop
      muted
      playsInline
      preload={eager ? "auto" : "metadata"}
      className={className}
    />
  );
}
