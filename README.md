# ArchMind AI

> **Your AI Architecture & Interior Design Partner — From Pinterest Board to Blueprint**

---

## Problem Statement

Clients come to architects and interior designers with folders of Pinterest screenshots, Instagram saves, and magazine clippings. Translating that visual chaos into a coherent design brief — and then into spatial reality — takes **weeks of discovery meetings, manual mood boarding, and iterative back-and-forth.**

No tool today takes a client's raw inspiration images, understands their underlying design intent, and produces a unified architectural concept — exterior form, interior spaces, materials, and mood board — in a single conversation. Every existing tool handles one slice of the pipeline: generate a render, OR plan a floor, OR apply a style preset. None connects **client inspiration → Design DNA extraction → unified architecture + interior concept → iterative dialogue → deliverable package.**

---

## Solution Description

ArchMind AI is a web application that turns a client's inspiration image board into a complete architectural concept package through a single conversational flow.

**How it works:**

1. **Start a project** — name it, set property type (villa, apartment, commercial) and budget tier
2. **Upload a reference board** — drag and drop 3–10 inspiration images, label each as *Love this*, *Like parts*, or *Just mood*
3. **AI extracts Design DNA** — vision AI analyses all images simultaneously and produces a structured brief: style archetype, colour palette (hex codes), materials, lighting character, and spatial notes
4. **Concept generation** — 7 renders generated in one pass: 3 exterior concepts, living room, kitchen, master bedroom, and a schematic floor plan — all coherent with the same Design DNA
5. **Conversational refinement** — chat to refine: *"make it warmer"*, *"add a courtyard"*, *"higher ceilings"* — the AI re-generates specific renders with the requested changes
6. **Material mood board** — extracted palette visualised as a material swatch strip

**Key differentiators vs. existing tools:**

| Capability | RoomGPT / InteriorAI | Maket / ArchGPT | Midjourney | ArchMind AI |
|---|---|---|---|---|
| Multi-image reference board | Single image | Text only | Partial | ✅ Full board |
| Design DNA extraction | ✗ | ✗ | ✗ | ✅ Automated |
| Exterior + interior unified concept | ✗ | ✗ | ✗ | ✅ Unified pipeline |
| Conversational refinement | ✗ | ✗ | ✗ | ✅ Multi-turn |
| Material palette | Presets only | ✗ | ✗ | ✅ Extracted + sourced |

---

## AI Approach and Architecture

ArchMind AI is built on a 3-layer AI pipeline:

### Layer 1 — Design DNA Engine
- **Model:** GPT-4o Vision (via Bob's inference API)
- **Input:** Up to 10 reference images encoded as base64 data URLs, each tagged with a client priority label
- **Output:** Structured JSON — `{ style, mood, palette[], materials[], lighting, spatialNotes }`
- **Technique:** Multi-image aggregation prompt that weights images by priority label and resolves style conflicts into primary vs. accent axes

### Layer 2 — Generative Design Pipeline
- **Model:** DALL-E 3
- **Input:** Design DNA tokens (palette, materials, mood, style) injected into a structured architectural prompt template
- **Output:** 7 parallel renders — 3 exteriors, 3 interiors, 1 floor plan schematic
- **Key principle:** All renders share the same locked palette and material tokens, enforcing visual coherence across exterior and interior

### Layer 3 — Conversational Refinement Agent
- **Model:** GPT-4o (via Bob's inference API)
- **Technique:** Stateful dialogue with Design DNA in the system prompt; AI detects design-change intents and emits a structured `REGENERATE:{types[], refinement}` action that triggers selective re-rendering without rebuilding the full concept

### Tech Stack
```
Frontend:    Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript
AI:          GPT-4o Vision (analysis) · DALL-E 3 (renders) · GPT-4o (chat)
Inference:   IBM Bob API  →  https://api.us-east.bob.ibm.com/inference/v1
Upload:      react-dropzone (client-side, base64 encoded)
```

### API Routes
| Route | Purpose |
|---|---|
| `POST /api/analyze` | GPT-4o Vision multi-image Design DNA extraction |
| `POST /api/generate` | DALL-E 3 parallel render generation |
| `POST /api/chat` | GPT-4o conversational refinement with re-render action parsing |

---

## Selected Challenge Theme

**AI for Creative & Professional Workflows**

ArchMind AI targets the architecture and interior design industry — a $300B global AEC (Architecture, Engineering, Construction) market. The discovery-to-concept phase currently costs clients thousands in consultant fees and takes weeks. ArchMind compresses that into a 10-minute AI-driven conversation, making professional-grade design ideation accessible to homeowners, design students, and developers — not just firms with large budgets.

---

## How IBM Bob Was Used

IBM Bob was the **primary development environment and AI backbone** for this project:

### Development
- **Built entirely inside IBM Bob** — all code was written, refactored, and debugged using Bob's Agent mode
- Bob planned the full project architecture from the hackathon concept HTML, broke it into implementation phases, and executed each phase autonomously
- Bob diagnosed and fixed all build errors (TypeScript issues, Next.js hydration warnings, OpenAI module-scope instantiation bugs) without manual intervention

### AI Inference
- The app's API routes call **Bob's OpenAI-compatible inference endpoint** (`https://api.us-east.bob.ibm.com/
inference/v1`) using the Bob API key
- Authentication uses Bob's `apikey <key>` header format with `x-instance-id` and `x-team-id` routing headers discovered by Bob itself through reverse-engineering the Bob extension bundle
- This means **every Design DNA extraction and every refinement chat runs on Bob's infrastructure**, spending Bob credits rather than OpenAI credits

### Configuration
```bash
# .env.local
BOB_API_KEY=bob_prod_bob-apikey_...       # inference key
BOB_ADMIN_KEY=bob_prod_bob-admin_...      # admin key (profile lookup)
BOB_INSTANCE_ID=20260629-0402-4807-1116-1463d1c07bc3
BOB_TEAM_ID=019f118b-4841-7392-8413-98d28362f0b9
BOB_BASE_URL=https://api.us-east.bob.ibm.com/inference/v1
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Fill in your Bob API key and instance details

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create a project, drop 3–10 inspiration images, hit **Analyse Board**, and watch your architectural concept generate.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts   # GPT-4o Vision — Design DNA extraction
│   │   ├── generate/route.ts  # DALL-E 3 — parallel render generation
│   │   └── chat/route.ts      # GPT-4o — conversational refinement
│   ├── layout.tsx
│   └── page.tsx               # Landing + project setup
├── components/
│   ├── ProjectWorkspace.tsx   # Main two-pane layout + state machine
│   ├── ReferenceBoard.tsx     # Drag-and-drop image upload with priority labels
│   ├── DesignDNAPanel.tsx     # Style, palette, materials display
│   ├── RenderGallery.tsx      # Exterior / interior / floor plan cards
│   ├── MaterialMoodBoard.tsx  # Colour swatch strip
│   └── RefinementChat.tsx     # Conversational refinement interface
├── lib/
│   └── prompts.ts             # Structured prompt builders for all AI calls
└── types/
    └── index.ts               # Shared TypeScript types
```

---

*Made with IBM Bob*
