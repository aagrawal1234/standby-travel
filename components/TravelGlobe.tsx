"use client";

import { Plane } from "lucide-react";
import { motion } from "framer-motion";

export function TravelGlobe() {
  return (
    <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
      <motion.div
        className="absolute h-64 w-64 rounded-full bg-white/45 blur-2xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        aria-label="small animated travel globe"
        viewBox="0 0 260 260"
        className="relative h-full w-full overflow-visible"
      >
        <defs>
          <clipPath id="globe-clip">
            <circle cx="130" cy="130" r="72" />
          </clipPath>
          <linearGradient id="globe-fill" x1="66" y1="56" x2="190" y2="205">
            <stop stopColor="#fdf9f1" />
            <stop offset="1" stopColor="#dfe9e8" />
          </linearGradient>
          <radialGradient id="route-dot" cx="50%" cy="50%" r="50%">
            <stop stopColor="#e9a189" />
            <stop offset="1" stopColor="#d48770" />
          </radialGradient>
        </defs>

        <motion.circle
          cx="130"
          cy="130"
          r="72"
          fill="url(#globe-fill)"
          stroke="#ffffff"
          strokeWidth="7"
          filter="drop-shadow(0 22px 34px rgba(77, 63, 45, 0.15))"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ originX: "130px", originY: "130px" }}
        />

        <g clipPath="url(#globe-clip)">
          <motion.g
            animate={{ x: [0, -72, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <path
              d="M60 111C70 88 95 85 113 99C126 109 114 124 128 136C140 147 156 138 170 150C183 162 170 183 150 187C123 193 91 178 82 153C77 140 51 132 60 111Z"
              fill="#cbd9cc"
              opacity="0.8"
            />
            <path
              d="M150 82C171 74 195 84 199 102C202 117 185 124 173 116C161 108 139 111 134 100C131 93 139 86 150 82Z"
              fill="#e7d6bf"
              opacity="0.85"
            />
            <path
              d="M206 145C222 139 244 150 243 168C241 185 219 189 207 178C196 168 188 151 206 145Z"
              fill="#cbd9cc"
              opacity="0.78"
            />
            <path
              d="M-12 111C-2 88 23 85 41 99C54 109 42 124 56 136C68 147 84 138 98 150C111 162 98 183 78 187C51 193 19 178 10 153C5 140 -21 132 -12 111Z"
              fill="#cbd9cc"
              opacity="0.8"
            />
            <path
              d="M278 82C299 74 323 84 327 102C330 117 313 124 301 116C289 108 267 111 262 100C259 93 267 86 278 82Z"
              fill="#e7d6bf"
              opacity="0.85"
            />
          </motion.g>

          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
            style={{ originX: "130px", originY: "130px" }}
          >
            <ellipse
              cx="130"
              cy="130"
              rx="45"
              ry="72"
              stroke="#ffffff"
              strokeWidth="1.4"
              opacity="0.55"
            />
            <ellipse
              cx="130"
              cy="130"
              rx="72"
              ry="25"
              stroke="#ffffff"
              strokeWidth="1.4"
              opacity="0.5"
            />
          </motion.g>
        </g>

        <circle
          cx="130"
          cy="130"
          r="72"
          fill="none"
          stroke="#ded1c0"
          strokeWidth="1.2"
          opacity="0.7"
        />

        <motion.path
          d="M76 143C103 83 156 82 190 119"
          stroke="#bfb2a5"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="3 6"
          fill="none"
          animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <circle cx="76" cy="143" r="4.5" fill="url(#route-dot)" />
        <circle cx="190" cy="119" r="4.5" fill="url(#route-dot)" />
      </svg>

      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex h-8 w-8 items-center justify-center rounded-full text-[#343230]"
        animate={{
          x: [-72, -34, 12, 58],
          y: [8, -44, -48, -18],
          rotate: [-18, 4, 23, 38],
        }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Plane className="h-5 w-5 fill-[#343230] stroke-[#343230]" />
      </motion.div>
    </div>
  );
}
