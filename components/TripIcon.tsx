"use client";

import { motion } from "framer-motion";
import type { IconType } from "@/data/trips";

type TripIconProps = {
  iconType: IconType;
  className?: string;
};

const floatTransition = {
  duration: 3.8,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const drawTransition = {
  duration: 3.2,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut" as const,
};

export function TripIcon({ iconType, className }: TripIconProps) {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 180 120"
      className={className}
      fill="none"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {iconType === "bay-area" && <BayAreaIcon />}
      {iconType === "chicago" && <ChicagoIcon />}
      {iconType === "london" && <LondonIcon />}
      {iconType === "mount-tamalpais" && <MountTamIcon />}
      {iconType === "florida-san-diego" && <PalmWavesIcon />}
      {iconType === "cabo" && <CaboIcon />}
    </motion.svg>
  );
}

function BayAreaIcon() {
  return (
    <motion.g animate={{ y: [0, -3, 0] }} transition={floatTransition}>
      <path d="M20 86C44 76 62 78 85 85C111 93 136 90 158 80" stroke="#e9dfd4" strokeWidth="2" />
      <path d="M112 78C124 67 140 67 154 78" fill="#e8e4db" />
      <path d="M45 80V34M66 81V28M118 81V49M134 82V43" stroke="#dd876f" strokeWidth="3" strokeLinecap="round" />
      <path d="M37 52H73M109 62H142" stroke="#e8a18e" strokeWidth="2" strokeLinecap="round" />
      <motion.path d="M26 68C44 61 55 42 66 28C82 49 95 61 118 65C126 60 131 50 134 43" stroke="#dd876f" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0.45 }} animate={{ pathLength: [0.45, 1] }} transition={drawTransition} />
      <path d="M46 45H63M46 56H63M46 67H63M119 58H134M119 68H134" stroke="#f0c8bc" strokeWidth="2" strokeLinecap="round" />
      <path d="M146 39L149 41L152 39" stroke="#6f736c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  );
}

function ChicagoIcon() {
  return (
    <motion.g animate={{ y: [0, -2.5, 0] }} transition={floatTransition}>
      <path d="M29 88H151" stroke="#e7ded3" strokeWidth="2" strokeLinecap="round" />
      <path d="M47 88V68H58V88M61 88V55H72V88M75 88V63H88V88M92 88V42H105V88M108 88V23H119V88M122 88V51H134V88" fill="#dbe7e9" />
      <path d="M47 88V68H58V88M61 88V55H72V88M75 88V63H88V88M92 88V42H105V88M108 88V23H119V88M122 88V51H134V88" stroke="#b9ccd1" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M113 23V10" stroke="#6f8288" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M38 43C45 34 57 41 61 47H32C33 45 35 44 38 43Z" stroke="#bed4da" strokeWidth="1.5" />
      <motion.g animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M74 20V30M69 25H79M70.5 21.5L77.5 28.5M77.5 21.5L70.5 28.5" stroke="#dce9ec" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M133 28V36M129 32H137" stroke="#dce9ec" strokeWidth="1.4" strokeLinecap="round" />
      </motion.g>
      <path d="M54 74H55M66 63H67M82 70H83M98 51H99M114 38H115M128 60H129" stroke="#f9fbfb" strokeWidth="2" strokeLinecap="round" />
    </motion.g>
  );
}

function LondonIcon() {
  return (
    <motion.g animate={{ y: [0, -2.5, 0] }} transition={floatTransition}>
      <path d="M33 88H151" stroke="#e7ded3" strokeWidth="2" strokeLinecap="round" />
      <path d="M73 88V35H96V88" fill="#efe3cf" stroke="#cdbb9b" strokeWidth="1.5" />
      <path d="M78 35L84.5 20L91 35" fill="#d7e5e8" stroke="#98adb1" strokeWidth="1.4" />
      <path d="M84.5 20V12" stroke="#6f8288" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="84.5" cy="52" r="8" fill="#fbf8f1" stroke="#98adb1" strokeWidth="1.4" />
      <path d="M84.5 48V52L88 55" stroke="#98adb1" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M78 66H91M78 75H91" stroke="#d8c3a6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 60C45 51 57 58 61 64H32C33 62 35 61 38 60Z" stroke="#bed4da" strokeWidth="1.5" />
      <motion.g animate={{ x: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="119" y="72" width="26" height="13" rx="2" fill="#d7735e" />
        <path d="M123 75H139M123 79H139" stroke="#f7d7ce" strokeWidth="1" strokeLinecap="round" />
        <circle cx="125" cy="86" r="2" fill="#7d6d63" />
        <circle cx="139" cy="86" r="2" fill="#7d6d63" />
      </motion.g>
    </motion.g>
  );
}

function MountTamIcon() {
  return (
    <motion.g animate={{ y: [0, -3, 0] }} transition={floatTransition}>
      <motion.circle cx="132" cy="33" r="8" fill="#f4b49f" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <path d="M22 87C47 64 68 57 94 86C112 68 136 61 159 87H22Z" fill="#e5e6dc" />
      <path d="M50 87C72 69 94 67 118 87H50Z" fill="#d7ddd2" />
      <path d="M21 87C47 64 68 57 94 86C112 68 136 61 159 87" stroke="#cbd3c9" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M38 75C39 66 45 63 48 72M48 72C52 65 58 68 58 77" stroke="#929c8d" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M45 72V84M56 75V86" stroke="#9c8874" strokeWidth="1.4" strokeLinecap="round" />
      <motion.path d="M73 68C83 64 91 66 101 72" stroke="#f1eadf" strokeWidth="2" strokeLinecap="round" animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
    </motion.g>
  );
}

function PalmWavesIcon() {
  return (
    <motion.g animate={{ y: [0, -3, 0] }} transition={floatTransition}>
      <path d="M29 84C48 77 65 77 83 84C103 91 125 90 151 80" fill="#efe4d4" />
      <motion.circle cx="112" cy="68" r="12" fill="#f1a68f" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <path d="M81 85C95 75 111 75 127 85C141 92 155 88 163 82" stroke="#a9c4ca" strokeWidth="2" strokeLinecap="round" />
      <path d="M63 84C76 75 92 75 108 84" stroke="#bcd3d7" strokeWidth="2" strokeLinecap="round" />
      <path d="M63 84C66 61 71 47 82 31" stroke="#9d826c" strokeWidth="5" strokeLinecap="round" />
      <motion.g animate={{ rotate: [-3, 4, -3] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "82px", originY: "31px" }}>
        <path d="M82 31C70 20 58 22 50 28C63 29 73 33 82 31Z" fill="#7d8e75" />
        <path d="M82 31C75 17 80 8 91 3C91 17 88 26 82 31Z" fill="#819678" />
        <path d="M82 31C95 18 111 20 121 28C104 28 93 33 82 31Z" fill="#72866c" />
        <path d="M82 31C91 34 98 42 101 53C89 49 83 40 82 31Z" fill="#899b7e" />
      </motion.g>
    </motion.g>
  );
}

function CaboIcon() {
  return (
    <motion.g animate={{ y: [0, -3, 0] }} transition={floatTransition}>
      <path d="M32 88C58 74 87 73 114 87C130 95 149 92 160 84" stroke="#e8dccd" strokeWidth="2" strokeLinecap="round" />
      <motion.circle cx="123" cy="43" r="8" fill="#f1a68f" animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
      <path d="M62 87V58" stroke="#8d9b7b" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 72C50 72 50 61 50 61M62 68C74 68 74 57 74 57" stroke="#8d9b7b" strokeWidth="4" strokeLinecap="round" />
      <path d="M120 83C120 66 128 57 136 51C141 64 139 76 132 88" fill="#f4e0c9" stroke="#d7b58e" strokeWidth="1.5" />
      <path d="M128 58V85" stroke="#d7b58e" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M47 42L51 44L55 42M139 34L143 36L147 34" stroke="#6f736c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  );
}
