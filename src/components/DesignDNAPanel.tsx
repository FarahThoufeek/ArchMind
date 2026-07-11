"use client";

import type { DesignDNA } from "@/types";

interface Props {
  dna: DesignDNA;
}

export default function DesignDNAPanel({ dna }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Style */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
          Style
        </p>
        <p className="text-xs font-bold text-zinc-900">{dna.style}</p>
      </div>

      {/* Mood */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
          Mood
        </p>
        <p className="text-xs font-bold text-zinc-900">{dna.mood}</p>
      </div>

      {/* Palette */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
          Palette
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {dna.palette.map((hex) => (
            <div key={hex} className="flex flex-col items-center gap-0.5">
              <div
                className="w-7 h-7 rounded border border-black/10"
                style={{ background: hex }}
                title={hex}
              />
              <span className="text-[8px] text-zinc-400">{hex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
          Materials
        </p>
        <p className="text-xs text-zinc-800 leading-5">
          {dna.materials.join(" · ")}
        </p>
      </div>

      {/* Lighting */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
          Lighting
        </p>
        <p className="text-xs text-zinc-600">{dna.lighting}</p>
      </div>

      {/* Spatial Notes */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
          Spatial Character
        </p>
        <p className="text-xs text-zinc-600">{dna.spatialNotes}</p>
      </div>
    </div>
  );
}
