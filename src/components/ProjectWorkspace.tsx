"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  ReferenceImage,
  DesignDNA,
  Render,
  RenderType,
  ChatMessage,
  ProjectMeta,
  ProjectPhase,
} from "@/types";
import ReferenceBoard from "@/components/ReferenceBoard";
import DesignDNAPanel from "@/components/DesignDNAPanel";
import MaterialMoodBoard from "@/components/MaterialMoodBoard";
import RenderGallery from "@/components/RenderGallery";
import RefinementChat from "@/components/RefinementChat";

const ALL_RENDER_TYPES: RenderType[] = [
  "exterior-a",
  "exterior-b",
  "exterior-c",
  "living",
  "kitchen",
  "bedroom",
  "floor-plan",
];

const RENDER_LABELS: Record<RenderType, string> = {
  "exterior-a": "Exterior — Concept A",
  "exterior-b": "Exterior — Concept B",
  "exterior-c": "Exterior — Concept C",
  living: "Living Room",
  kitchen: "Kitchen",
  bedroom: "Master Bedroom",
  "floor-plan": "Floor Plan",
};

function makeEmptyRenders(): Render[] {
  return ALL_RENDER_TYPES.map((type) => ({
    type,
    label: RENDER_LABELS[type],
    imageUrl: null,
    loading: false,
  }));
}

const INITIAL_AI_MESSAGE: ChatMessage = {
  id: uuidv4(),
  role: "assistant",
  content:
    "Upload your reference images above and click **Analyse Board** to extract your Design DNA. Then I'll generate your full concept package — exterior renders, interior spaces, floor plan, and material palette.",
};

interface Props {
  meta: ProjectMeta;
  onBack: () => void;
}

export default function ProjectWorkspace({ meta, onBack }: Props) {
  const [phase, setPhase] = useState<ProjectPhase>("upload");
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [dna, setDna] = useState<DesignDNA | null>(null);
  const [renders, setRenders] = useState<Render[]>(makeEmptyRenders());
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_AI_MESSAGE]);
  const [lightboxRender, setLightboxRender] = useState<Render | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateRenderLoading = useCallback(
    (types: RenderType[], loading: boolean) => {
      setRenders((prev) =>
        prev.map((r) => (types.includes(r.type) ? { ...r, loading } : r))
      );
    },
    []
  );

  const updateRenderUrls = useCallback(
    (results: { type: RenderType; imageUrl: string }[]) => {
      setRenders((prev) =>
        prev.map((r) => {
          const found = results.find((res) => res.type === r.type);
          return found ? { ...r, imageUrl: found.imageUrl, loading: false } : r;
        })
      );
    },
    []
  );

  const handleAnalyse = async () => {
    if (images.length === 0) return;
    setPhase("analyzing");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, meta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setDna(data.dna);

      // Add AI message
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: `I've analysed your ${images.length} reference images. Your Design DNA points to **${data.dna.style}** — ${data.dna.mood.toLowerCase()}, with ${data.dna.materials.slice(0, 3).join(", ")} as primary materials. Shall I generate your full concept package?`,
        },
      ]);

      // Kick off generation
      await handleGenerate(data.dna, ALL_RENDER_TYPES);
    } catch (e) {
      setError((e as Error).message);
      setPhase("upload");
    }
  };

  const handleGenerate = async (
    dnaToUse: DesignDNA,
    types: RenderType[],
    refinement?: string
  ) => {
    setPhase("generating");
    updateRenderLoading(types, true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ types, dna: dnaToUse, meta, refinement }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      updateRenderUrls(data.renders);
      setPhase("refining");
    } catch (e) {
      setError((e as Error).message);
      updateRenderLoading(types, false);
      setPhase(dna ? "refining" : "upload");
    }
  };

  const handleRegenerate = (types: RenderType[], refinement: string) => {
    if (!dna) return;
    handleGenerate(dna, types, refinement);
  };

  const isAnalyzing = phase === "analyzing";
  const isGenerating = phase === "generating";
  const isBusy = isAnalyzing || isGenerating;
  const hasGenerated = renders.some((r) => r.imageUrl !== null);

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-white text-sm font-semibold ml-2">
            ArchMind AI
          </span>
          <span className="text-zinc-400 text-sm">—</span>
          <span className="text-white text-sm">{meta.name}</span>
          <span className="text-zinc-600 text-xs ml-1 capitalize">
            · {meta.propertyType} · {meta.budgetTier}
          </span>
        </div>
        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
        >
          ← New Project
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
            {/* Reference board */}
            <div>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Reference Board
              </p>
              <ReferenceBoard
                images={images}
                onChange={setImages}
                disabled={isBusy}
              />
            </div>

            {/* Analyse button */}
            {!dna && (
              <button
                onClick={handleAnalyse}
                disabled={images.length === 0 || isBusy}
                className="w-full bg-blue-500 text-white rounded-lg py-2.5 text-xs font-bold hover:bg-blue-600 disabled:opacity-40 transition-colors"
              >
                {isAnalyzing ? "Analysing…" : "Analyse Board"}
              </button>
            )}

            {/* Design DNA */}
            {dna && (
              <>
                <DesignDNAPanel dna={dna} />
                <button
                  onClick={handleAnalyse}
                  disabled={images.length === 0 || isBusy}
                  className="w-full bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg py-2 text-xs font-semibold hover:bg-zinc-200 disabled:opacity-40 transition-colors"
                >
                  Re-analyse Board
                </button>
              </>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </p>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Renders + mood board */}
          <div className="flex-1 overflow-y-auto p-5">
            {isGenerating && !hasGenerated && (
              <div className="flex items-center gap-3 text-sm text-zinc-500 mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Generating your concept package — this takes about a minute…
              </div>
            )}

            <RenderGallery
              renders={renders}
              onExpand={setLightboxRender}
            />

            {dna && hasGenerated && (
              <div className="mt-5">
                <MaterialMoodBoard dna={dna} />
              </div>
            )}

            {!dna && !isBusy && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-4xl mb-4">🏛</div>
                <h2 className="text-lg font-semibold text-zinc-800 mb-2">
                  Your concept will appear here
                </h2>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Upload reference images in the sidebar, then click Analyse
                  Board to extract your Design DNA and generate renders.
                </p>
              </div>
            )}
          </div>

          {/* Chat panel */}
          {dna && (
            <div className="h-72 flex-shrink-0 border-t border-zinc-200 bg-white px-5 py-3 flex flex-col">
              <RefinementChat
                messages={messages}
                dna={dna}
                meta={meta}
                onMessagesChange={setMessages}
                onRegenerate={handleRegenerate}
                disabled={isBusy}
              />
            </div>
          )}
        </main>
      </div>

      {/* Lightbox */}
      {lightboxRender && lightboxRender.imageUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setLightboxRender(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxRender.imageUrl}
              alt={lightboxRender.label}
              className="w-full rounded-xl"
            />
            <p className="text-white text-sm text-center mt-3 opacity-70">
              {lightboxRender.label}
            </p>
            <button
              onClick={() => setLightboxRender(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full text-zinc-800 font-bold hover:bg-zinc-100 flex items-center justify-center text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
