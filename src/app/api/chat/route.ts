import { NextRequest, NextResponse } from "next/server";
import type { DesignDNA, ProjectMeta, ChatMessage } from "@/types";
import { buildChatSystemPrompt } from "@/lib/prompts";
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
  const {
    messages,
    dna,
    meta,
  }: {
    messages: ChatMessage[];
    dna: DesignDNA;
    meta: ProjectMeta;
  } = await req.json();

  const systemPrompt = buildChatSystemPrompt(dna, meta);

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 600,
      temperature: 0.7,
    });
  } catch (err: unknown) {
    const handled = openAIErrorResponse(err);
    if (handled) return handled;
    throw err;
  }

  const msg = response.choices[0].message as unknown as Record<string, unknown>;
  const content: string =
    (msg.content as string | null) ??
    (msg.reasoning_content as string | null) ??
    "";

  // Parse out REGENERATE action if present
  const regenMatch = content.match(/REGENERATE:(\{[\s\S]*\})/);
  let action: { types: string[]; refinement: string } | null = null;
  let text = content;

  if (regenMatch) {
    try {
      action = JSON.parse(regenMatch[1]);
      text = content.replace(/REGENERATE:\{[\s\S]*\}/, "").trim();
    } catch {
      // leave action as null
    }
  }

  return NextResponse.json({ content: text, action });
}
