import { NextRequest, NextResponse } from "next/server";
import type { DesignDNA, ProjectMeta, RenderType } from "@/types";
import { buildRenderPrompt } from "@/lib/prompts";
import { getBobClient } from "@/lib/bobClient";

const RENDER_LABELS: Record<RenderType, string> = {
  "exterior-a": "Exterior — Concept A",
  "exterior-b": "Exterior — Concept B",
  "exterior-c": "Exterior — Concept C",
  living: "Living Room",
  kitchen: "Kitchen",
  bedroom: "Master Bedroom",
  "floor-plan": "Floor Plan",
};

/**
 * Bob's inference API does not expose an image generation endpoint.
 * Instead we use the LLM to write a vivid architectural description for each
 * render type, then return a branded SVG placeholder that displays the
 * Design DNA palette and the description — keeping the full UI flow working.
 */
function makeSvgPlaceholder(
  type: RenderType,
  dna: DesignDNA,
  description: string
): string {
  const label = RENDER_LABELS[type];
  const [c1 = "#E8D5B7", c2 = "#2C2C2C", c3 = "#C9B99A", c4 = "#7B6651", c5 = "#D8CFC4"] =
    dna.palette;

  const isFloor = type === "floor-plan";

  // Wrap description text into lines of ~42 chars
  const words = description.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 42) { lines.push(cur.trim()); cur = w; }
    else { cur = (cur + " " + w).trim(); }
    if (lines.length >= 6) { lines.push("…"); break; }
  }
  if (cur && lines.length < 7) lines.push(cur.trim());

  const textRows = lines
    .map((l, i) => `<text x="200" y="${185 + i * 18}" text-anchor="middle" font-size="11" fill="${c5}" font-family="system-ui,sans-serif">${l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text>`)
    .join("\n");

  const floorSvg = `
    <rect x="60" y="60" width="280" height="200" fill="none" stroke="${c2}" stroke-width="2"/>
    <rect x="60" y="60" width="140" height="90"  fill="none" stroke="${c2}" stroke-width="1.5"/>
    <rect x="200" y="60" width="140" height="90" fill="none" stroke="${c2}" stroke-width="1.5"/>
    <rect x="60" y="150" width="90"  height="110" fill="none" stroke="${c2}" stroke-width="1.5"/>
    <rect x="150" y="150" width="90"  height="110" fill="none" stroke="${c2}" stroke-width="1.5"/>
    <rect x="240" y="150" width="100" height="110" fill="none" stroke="${c2}" stroke-width="1.5"/>
    <text x="130" y="112" text-anchor="middle" font-size="9" fill="${c4}" font-family="system-ui">Living</text>
    <text x="270" y="112" text-anchor="middle" font-size="9" fill="${c4}" font-family="system-ui">Kitchen</text>
    <text x="105" y="212" text-anchor="middle" font-size="9" fill="${c4}" font-family="system-ui">Bed 1</text>
    <text x="195" y="212" text-anchor="middle" font-size="9" fill="${c4}" font-family="system-ui">Bed 2</text>
    <text x="290" y="212" text-anchor="middle" font-size="9" fill="${c4}" font-family="system-ui">Master</text>`;

  const renderSvg = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
    </defs>
    <rect x="40" y="40" width="320" height="160" rx="6" fill="url(#bg)"/>
    <rect x="40" y="40" width="320" height="160" rx="6" fill="none" stroke="${c4}" stroke-width="1"/>
    <text x="200" y="130" text-anchor="middle" font-size="13" fill="${c2}" font-family="system-ui" font-weight="600">${dna.style}</text>
    <text x="200" y="150" text-anchor="middle" font-size="10" fill="${c4}" font-family="system-ui">${dna.mood}</text>`;

  // Palette swatches
  const swatchW = 64;
  const swatches = [c1, c2, c3, c4, c5]
    .map((c, i) => `<rect x="${i * swatchW}" y="370" width="${swatchW}" height="20" fill="${c}"/>`)
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f7f8fa"/>
  ${isFloor ? floorSvg : renderSvg}
  <!-- label -->
  <text x="200" y="30" text-anchor="middle" font-size="11" font-weight="700" fill="${c2}" font-family="system-ui,sans-serif" text-transform="uppercase" letter-spacing="1">${label.toUpperCase()}</text>
  <!-- description -->
  ${textRows}
  <!-- palette -->
  ${swatches}
  <text x="200" y="405" text-anchor="middle" font-size="8" fill="#9ca3af" font-family="system-ui">Image generation not available on Bob trial — showing Design DNA brief</text>
</svg>`;
}

function svgToDataUrl(svg: string): string {
  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

export async function POST(req: NextRequest) {
  const openai = getBobClient();
  const {
    types,
    dna,
    meta,
    refinement,
  }: {
    types: RenderType[];
    dna: DesignDNA;
    meta: ProjectMeta;
    refinement?: string;
  } = await req.json();

  const results = await Promise.all(
    types.map(async (type) => {
      const prompt = buildRenderPrompt(type, dna, meta, refinement);

      // Ask the LLM for a vivid one-paragraph description of the render
      let description = `${dna.style} ${RENDER_LABELS[type].toLowerCase()} — ${dna.mood.toLowerCase()}, featuring ${dna.materials.slice(0, 3).join(", ")}.`;
      try {
        const resp = await openai.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content:
                "You are an architectural visualisation expert. Write a single vivid sentence (max 30 words) describing this render as if viewing the finished space. Be specific about materials, light, and atmosphere. No preamble.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 80,
          temperature: 0.7,
        });
        const m = resp.choices[0].message as unknown as Record<string, unknown>;
        description =
          ((m.content as string | null) ?? (m.reasoning_content as string | null))?.trim()
          ?? description;
      } catch {
        // fall back to template description
      }

      const svg = makeSvgPlaceholder(type, dna, description);
      return { type, imageUrl: svgToDataUrl(svg) };
    })
  );

  return NextResponse.json({ renders: results });
}
