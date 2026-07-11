import type { DesignDNA, ProjectMeta, RenderType } from "@/types";

export function buildDnaSystemPrompt(): string {
  return `You are an expert architectural design analyst. Analyse the provided reference images and extract a structured Design DNA that captures the client's aesthetic intent. Return ONLY valid JSON — no markdown, no code fences.`;
}

export function buildDnaUserPrompt(meta: ProjectMeta): string {
  return `Analyse all ${meta.propertyType} inspiration images above. Return a JSON object with exactly these keys:
{
  "style": "concise style name (e.g. Contemporary Arabian, Japandi, Mediterranean Modern)",
  "mood": "3-4 adjectives joined with · (e.g. Warm · Airy · Open)",
  "palette": ["#hex1","#hex2","#hex3","#hex4","#hex5"],
  "materials": ["Material1","Material2","Material3","Material4","Material5"],
  "lighting": "one sentence describing the lighting character",
  "spatialNotes": "one sentence about spatial qualities and volumes"
}`;
}

const RENDER_LABEL_MAP: Record<RenderType, string> = {
  "exterior-a": "exterior concept A",
  "exterior-b": "exterior concept B",
  "exterior-c": "exterior concept C",
  living: "open-plan living room interior",
  kitchen: "kitchen interior",
  bedroom: "master bedroom interior",
  "floor-plan": "schematic architectural floor plan",
};

export function buildRenderPrompt(
  type: RenderType,
  dna: DesignDNA,
  meta: ProjectMeta,
  refinement?: string
): string {
  const label = RENDER_LABEL_MAP[type];
  const palette = (dna.palette ?? []).join(", ");
  const materials = (dna.materials ?? []).join(", ");
  const isFloorPlan = type === "floor-plan";

  if (isFloorPlan) {
    return `Architectural schematic floor plan drawing for a ${meta.propertyType}, top-down 2D view, clean line art on white background. Layout suits ${dna.style} style with ${dna.spatialNotes}. Include labelled rooms: living, dining, kitchen, 3-4 bedrooms, bathrooms, entrance. Minimal, clean, professional architectural drawing style.${refinement ? ` Additional requirement: ${refinement}` : ""}`;
  }

  return `Photorealistic architectural render of a ${meta.budgetTier} ${meta.propertyType} — ${label}. Style: ${dna.style}. Mood: ${dna.mood}. Colour palette dominated by ${palette}. Primary materials: ${materials}. Lighting: ${dna.lighting}. Spatial quality: ${dna.spatialNotes}. Professional architectural photography, 8K, cinematic lighting, no people.${refinement ? ` Additional requirement: ${refinement}` : ""}`;
}

export function buildChatSystemPrompt(
  dna: DesignDNA,
  meta: ProjectMeta
): string {
  return `You are ArchMind AI, an expert architectural design assistant. The client is working on a ${meta.budgetTier} ${meta.propertyType} project called "${meta.name}".

Current Design DNA:
- Style: ${dna.style}
- Mood: ${dna.mood}
- Materials: ${dna.materials.join(", ")}
- Spatial notes: ${dna.spatialNotes}

Your role: help the client refine their design through conversation. Be specific, architectural, and inspiring. When the client requests a design change, acknowledge it warmly and return a JSON action block at the very end of your message in this exact format (no markdown code fences):

REGENERATE:{"types":["exterior-a"],"refinement":"description of the specific change"}

Only include REGENERATE if the client explicitly asks to change/update/regenerate a visual aspect. Otherwise just converse naturally. Keep responses concise (2-4 sentences).`;
}
