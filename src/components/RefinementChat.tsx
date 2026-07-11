"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage, DesignDNA, ProjectMeta, RenderType } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface Props {
  messages: ChatMessage[];
  dna: DesignDNA;
  meta: ProjectMeta;
  onMessagesChange: (messages: ChatMessage[]) => void;
  onRegenerate?: (types: RenderType[], refinement: string) => void;
  disabled?: boolean;
}

export default function RefinementChat({
  messages,
  dna,
  meta,
  onMessagesChange,
  onRegenerate,
  disabled,
}: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: uuidv4(), role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    onMessagesChange(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, dna, meta }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.content,
      };
      onMessagesChange([...nextMessages, aiMsg]);

      if (data.action && onRegenerate) {
        onRegenerate(data.action.types as RenderType[], data.action.refinement);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
        Refinement Chat
      </p>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0 pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div
              className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold mt-0.5
                ${msg.role === "assistant" ? "bg-blue-500 text-white" : "bg-zinc-200 text-zinc-600"}`}
            >
              {msg.role === "assistant" ? "AI" : "C"}
            </div>
            <div
              className={`flex-1 rounded-lg px-3 py-2 text-xs leading-relaxed
                ${msg.role === "assistant" ? "bg-blue-50 border border-blue-200 text-zinc-800" : "bg-zinc-50 border border-zinc-200 text-zinc-700"}`}
              dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white mt-0.5">
              AI
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask anything about your design…"
          disabled={disabled || loading}
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={disabled || loading || !input.trim()}
          className="bg-blue-500 text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-blue-600 disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
