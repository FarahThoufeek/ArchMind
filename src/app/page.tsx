"use client";

import { useState } from "react";
import type { ProjectMeta } from "@/types";
import ProjectWorkspace from "@/components/ProjectWorkspace";

const PROPERTY_TYPES: ProjectMeta["propertyType"][] = [
  "villa",
  "apartment",
  "commercial",
];
const BUDGET_TIERS: ProjectMeta["budgetTier"][] = [
  "standard",
  "premium",
  "luxury",
];

export default function Home() {
  const [project, setProject] = useState<ProjectMeta | null>(null);
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] =
    useState<ProjectMeta["propertyType"]>("villa");
  const [budgetTier, setBudgetTier] =
    useState<ProjectMeta["budgetTier"]>("luxury");

  if (project) {
    return (
      <ProjectWorkspace
        meta={project}
        onBack={() => setProject(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-block bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-widest uppercase">
            Hackathon Concept
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            ArchMind AI
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your AI Architecture &amp; Interior Design Partner.
            <br />
            From Pinterest board to blueprint — in one conversation.
          </p>
        </div>

        {/* Setup form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dream Home · Dubai Hills"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Property Type
            </label>
            <div className="flex gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setPropertyType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize border transition-colors
                    ${propertyType === t ? "bg-blue-500 border-blue-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Budget Tier
            </label>
            <div className="flex gap-2">
              {BUDGET_TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setBudgetTier(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize border transition-colors
                    ${budgetTier === t ? "bg-blue-500 border-blue-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() =>
              setProject({ name: name.trim() || "My Project", propertyType, budgetTier })
            }
            className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-xl py-3 text-sm font-bold transition-colors mt-1"
          >
            Start Project →
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {[
            "Reference-to-Design Pipeline",
            "Design DNA Extraction",
            "Exterior + Interior Renders",
            "Conversational Refinement",
          ].map((label) => (
            <span
              key={label}
              className="bg-zinc-800/60 border border-zinc-700 text-zinc-400 text-xs px-3 py-1 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>

        <p className="text-center text-zinc-700 text-xs mt-8">
          Powered by GPT-4o Vision + DALL·E 3
        </p>
      </div>
    </div>
  );
}
