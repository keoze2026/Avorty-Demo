"use client";

/**
 * ChatWidget — floating bottom-right chat bubble for the marketing surface.
 *
 * Click the FAB to expand a chat panel; messages POST to /api/chat which
 * proxies to the Anthropic API. Conversation history stays in component
 * state (cleared on page reload).
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Message = {
  role: "assistant",
  content:
    "Hey — I'm Vortyx AI. Ask me anything about the platform, or just chat.",
};

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([GREETING]);
  const [input, setInput] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pending]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || pending) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const reply =
        data.reply?.trim() ||
        (data.error
          ? `Sorry — ${data.error}`
          : "Sorry, I couldn't reach the model. Try again in a moment.");
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Network hiccup — please try that again.",
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full",
          "border border-border bg-foreground text-background shadow-lg shadow-black/40",
          "transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "fixed bottom-20 right-5 z-50 flex w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden",
              "rounded-2xl border border-border bg-background/95 shadow-2xl shadow-black/50 backdrop-blur-md",
            )}
            style={{ height: "min(32rem, calc(100vh - 7rem))" }}
            role="dialog"
            aria-label="Vortyx AI chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background bg-[oklch(0.78_0.18_155)]" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">Vortyx AI</div>
                  <div className="text-[10px] text-muted-foreground">
                    Online · usually replies instantly
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} />
              ))}
              {pending && (
                <div className="flex items-center gap-2 pl-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Vortyx AI is typing…
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border/80 bg-background/60 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Ask me anything…"
                  rows={1}
                  className={cn(
                    "max-h-32 min-h-[2.25rem] flex-1 resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  )}
                  disabled={pending}
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={pending || !input.trim()}
                  aria-label="Send message"
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    "bg-accent text-accent-foreground transition-colors hover:bg-accent/90",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
                Powered by Anthropic · Conversations aren't saved.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ role, content }: Message) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-accent text-accent-foreground"
            : "rounded-bl-sm bg-secondary text-foreground",
        )}
      >
        {content}
      </div>
    </div>
  );
}
