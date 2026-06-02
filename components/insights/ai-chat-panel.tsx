"use client";

/**
 * Premium chat panel — the "Vortyx Copilot".
 * Suggested prompts as chips → simulated thinking dots → canned multi-line reply.
 * Animated accent halo around the assistant avatar.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, User } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CHAT_REPLIES, MOCK_CHAT_SUGGESTIONS } from "@/lib/mock/insights";
import type { ChatSuggestion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** For assistant messages, broken into multi-bubble paragraphs */
  bubbles?: string[];
}

const SUGGESTION_BY_TEXT = new Map(MOCK_CHAT_SUGGESTIONS.map((s) => [s.question.toLowerCase(), s]));

function pickCategoryFor(text: string): ChatSuggestion["category"] {
  const lower = text.toLowerCase();
  const exact = SUGGESTION_BY_TEXT.get(lower);
  if (exact) return exact.category;
  if (/forecast|next \d|projection/.test(lower)) return "forecast";
  if (/why|explain|cause/.test(lower)) return "anomaly";
  if (/best|top|scale/.test(lower)) return "performance";
  return "explain";
}

export function AiChatPanel() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m_intro",
      role: "assistant",
      bubbles: [
        t("toolsUI.insights.chat.introLine1"),
        t("toolsUI.insights.chat.introLine2"),
      ],
      text: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const ask = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
    const category = pickCategoryFor(text);
    const reply = CHAT_REPLIES[category];
    const assistantMsg: ChatMessage = {
      id: `a_${Date.now()}`,
      role: "assistant",
      text: reply.join(" "),
      bubbles: reply,
    };
    setThinking(false);
    setMessages((m) => [...m, assistantMsg]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <Card className="flex max-h-[640px] flex-col overflow-hidden">
      <CardHeader className="border-b border-border/60 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-accent" />
          {t("toolsUI.insights.chat.title")}
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-medium text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            {t("toolsUI.insights.chat.online")}
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("toolsUI.insights.chat.description")}
        </p>
      </CardHeader>

      {/* Scrolling messages area */}
      <div
        ref={scrollerRef}
        className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          {thinking && <ThinkingBubble key="thinking" />}
        </AnimatePresence>
      </div>

      {/* Suggestion chips */}
      <CardContent className="space-y-3 border-t border-border/60 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {MOCK_CHAT_SUGGESTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => ask(s.question)}
              disabled={thinking}
              className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50"
            >
              {s.question}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("toolsUI.insights.chat.inputPlaceholder")}
            disabled={thinking}
            className="h-10"
          />
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={thinking || !input.trim()}>
            <ArrowUp className="h-4 w-4" strokeWidth={3} />
          </Button>
        </form>
        <p className="text-center text-[11px] text-muted-foreground/70">
          {t("toolsUI.insights.chat.demoNote")}
        </p>
      </CardContent>
    </Card>
  );
}

/* ============ subcomponents ============ */

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="relative h-7 w-7 shrink-0">
          <motion.span
            aria-hidden
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--accent) 40%, transparent), transparent 70%)",
            }}
          />
          <Logo className="relative h-7 w-7" uid={`chat-${message.id}`} />
        </div>
      )}
      <div className={cn("flex max-w-[80%] flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
        {(message.bubbles ?? [message.text]).map((line, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl px-3 py-2 text-xs leading-relaxed",
              isUser
                ? "rounded-br-md bg-accent text-accent-foreground"
                : "rounded-tl-md border border-border bg-card",
            )}
          >
            {renderInline(line)}
          </div>
        ))}
      </div>
      {isUser && (
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
          <User className="h-3.5 w-3.5" />
        </span>
      )}
    </motion.div>
  );
}

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2"
    >
      <div className="relative h-7 w-7">
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--accent) 50%, transparent), transparent 70%)",
          }}
        />
        <Logo className="relative h-7 w-7" uid="chat-thinking" />
      </div>
      <div className="rounded-2xl rounded-tl-md border border-border bg-card px-3 py-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Lightweight **bold** + entity-highlight renderer.
 * Splits on **…** and renders the marked tokens in foreground / mono.
 */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(text.slice(last, m.index));
    }
    parts.push(
      <span key={`b-${i++}`} className="font-semibold text-foreground">
        {m[1]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}
