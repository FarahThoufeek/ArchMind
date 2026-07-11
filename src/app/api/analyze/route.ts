import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import type { ReferenceImage, ProjectMeta } from "@/types";
import { buildDnaSystemPrompt, buildDnaUserPrompt } from "@/lib/prompts";
import { getBobClient } from "@/lib/bobClient";

function openAIErrorResponse(err: unknown): NextResponse | null {
  const status = (err as { status?: number }).status;
  const code = (err as { code?: string }).code;
  if (status === 429 || code === "insufficient_quota") {
    return NextResponse.json(
      { error: "OpenAI quota exceeded. Please add billing credits at platform.openai.com/settings/billing." },
      { status: 429 }
    );
  }
  if (status === 401) {
    return NextResponse.json(
      { error: "Invalid OpenAI API key. Check your OPENAI_API_KEY in .env.local." },
      { status: 401 }
    );
  }
  return null;
}

export async function POST(req: NextRequest) {
  const openai = getBobClient();
  const { images, meta }: { images: ReferenceImage[]; meta: ProjectMeta } =
    await req.json();

  if (!images || images.length === 0) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  const imageContent: OpenAI.Chat.ChatCompletionContentPart[] = images.map(
    (img) => ({
      type: "image_url" as const,
      image_url: { url: img.dataUrl, detail: "low" as const },
    })
  );

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
    ...imageContent,
    { type: "text", text: buildDnaUserPrompt(meta) },
  ];

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: buildDnaSystemPrompt() },
        { role: "user", content: userContent },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });
  } catch (err: unknown) {
    const handled = openAIErrorResponse(err);
    if (handled) return handled;
    throw err;
  }

  // gpt-oss-20b sometimes puts the answer in reasoning_content when content is null
  const msg = response.choices[0].message as unknown as Record<string, unknown>;
  const raw: string =
    (msg.content as string | null) ??
    (msg.reasoning_content as string | null) ??
    "{}";

  let dna;
  try {
    // Extract first JSON object found in the response
    const match = raw.match(/\{[\s\S]*\}/);
    dna = match ? JSON.parse(match[0]) : {};
  } catch {
    dna = {};
  }

  // Ensure all required fields have safe defaults
  dna = {
    style:        dna.style        ?? "Contemporary",
    mood:         dna.mood         ?? "Modern · Clean",
    palette:      Array.isArray(dna.palette)   ? dna.palette   : ["#E8D5B7", "#2C2C2C", "#C9B99A", "#7B6651", "#D8CFC4"],
    materials:    Array.isArray(dna.materials)  ? dna.materials  : ["Concrete", "Timber", "Stone"],
    lighting:     dna.lighting     ?? "Natural diffused light",
    spatialNotes: dna.spatialNotes ?? "Open, airy volumes",
  };

  return NextResponse.json({ dna });
}
