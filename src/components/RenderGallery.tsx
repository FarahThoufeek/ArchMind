"use client";

import type { Render } from "@/types";

const RENDER_GROUPS: { label: string; types: Render["type"][] }[] = [
  { label: "Exterior Concepts", types: ["exterior-a", "exterior-b", "exterior-c"] },
  { label: "Interior Spaces", types: ["living", "kitchen", "bedroom"] },
  { label: "Floor Plan", types: ["floor-plan"] },
];

const RENDER_LABELS: Record<Render["type"], string> = {
  "exterior-a": "Concept A",
  "exterior-b": "Concept B",
  "exterior-c": "Concept C",
  living: "Living Room",
  kitchen: "Kitchen",
  bedroom: "Master Bedroom",
  "floor-plan": "Schematic Layout",
};

interface Props {
  renders: Render[];
  onExpand?: (render: Render) => void;
}

function RenderCard({ render, onExpand }: { render: Render; onExpand?: (r: Render) => void }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-zinc-100">
        {render.loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-zinc-400">Generating…</span>
            </div>
          </div>
        ) : render.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={render.imageUrl}
            alt={RENDER_LABELS[render.type]}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => onExpand?.(render)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-zinc-300 text-center px-2">
              {RENDER_LABELS[render.type]}
            </span>
          </div>
        )}
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wide">
          {RENDER_LABELS[render.type]}
        </p>
      </div>
    </div>
  );
}

export default function RenderGallery({ renders, onExpand }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {RENDER_GROUPS.map((group) => {
        const groupRenders = renders.filter((r) =>
          group.types.includes(r.type)
        );
        if (groupRenders.length === 0) return null;
        return (
          <div key={group.label}>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              {group.label}
            </p>
            <div
              className={`grid gap-2 ${
                group.types.length === 1 ? "grid-cols-1" : "grid-cols-3"
              }`}
            >
              {groupRenders.map((r) => (
                <RenderCard key={r.type} render={r} onExpand={onExpand} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
