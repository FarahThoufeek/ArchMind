"use client";

import type { DesignDNA } from "@/types";

interface Props {
  dna: DesignDNA;
}

export default function MaterialMoodBoard({ dna }: Props) {
  return (
    <div>
      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
        Material Mood Board
      </p>
      <div className="flex gap-2">
        {dna.palette.map((hex, i) => {
          const material = dna.materials[i] ?? "";
          // Determine text colour based on brightness
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          const textColor = brightness > 128 ? "#7B6651" : "#ffffff";
          return (
            <div
              key={hex}
              className="flex-1 h-14 rounded-lg flex items-center justify-center text-[9px] font-bold"
              style={{ background: hex, color: textColor }}
              title={hex}
            >
              {material}
            </div>
          );
        })}
      </div>
    </div>
  );
}
