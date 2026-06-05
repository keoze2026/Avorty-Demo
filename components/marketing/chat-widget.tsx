"use client";

/**
 * Marketing-site chat widget.
 *
 * Pattern:
 *   • Floating FAB bottom-right. Click to expand a glass panel.
 *   • The AI assistant ("Avortyx AI") handles the opening exchange via the
 *     Anthropic-proxy /api/chat endpoint.
 *   • After the AI replies, a "Talk to a person" escalation row offers the
 *     visitor 3 live team members or a direct path to Sales / Support.
 *   • When the visitor escalates, the panel switches into "live agent" mode —
 *     the header shows the agent's avatar, the next bubbles read as the
 *     agent's, and the operator console gets a real-time push notification
 *     ("Live chat request from a website visitor — handed to Maya").
 *   • Quick-reply chips sit above the composer for one-click intents
 *     (Pricing / Book a demo / Docs).
 *
 * Visual: thin transparent accent border + glass + soft accent halo, matching
 * the AuthCard / hero stage glass formula. Theme-aware via CSS vars.
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Headphones,
  LifeBuoy,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useTranslation } from "@/hooks/use-translation";
import { pushNotification } from "@/lib/store/push-notifications-store";
import { cn } from "@/lib/utils";

type Sender = "user" | "ai" | "agent" | "system";

interface Message {
  sender: Sender;
  content: string;
  /** Only set on agent messages. */
  agentId?: string;
  /** ms since epoch — drives the timestamp under each bubble. */
  at: number;
}

interface TeamMember {
  id: string;
  /** Two-letter initials — fallback only, used when the avatar image fails. */
  initials: string;
  /** Public-path portrait. When set, renders as <img> instead of initials. */
  avatar?: string;
  nameKey: string;
  roleKey: string;
  /** Tone class powering the avatar background + status dot. */
  tone: "accent" | "success" | "warning";
}

const TEAM: TeamMember[] = [
  {
    id: "maya",
    initials: "MR",
    avatar: "/avatars/83bde38df094aca69d1d004cafe2f7a2-1768088403848.webp",
    nameKey: "marketingUI.chat.team.maya.name",
    roleKey: "marketingUI.chat.team.maya.role",
    tone: "accent",
  },
  {
    id: "jordan",
    initials: "JK",
    avatar: "/avatars/c810599af876418d92d1781cb23e9cefydNGi.webp",
    nameKey: "marketingUI.chat.team.jordan.name",
    roleKey: "marketingUI.chat.team.jordan.role",
    tone: "success",
  },
  {
    id: "sofia",
    initials: "LP",
    avatar: "/avatars/e691af3ba1427582bb1b2cdf8a9d1f98-1770277350458.webp",
    nameKey: "marketingUI.chat.team.sofia.name",
    roleKey: "marketingUI.chat.team.sofia.role",
    tone: "warning",
  },
];

const TONE_BG: Record<TeamMember["tone"], string> = {
  accent: "bg-accent/15 text-accent",
  success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
};

const QUICK_REPLIES = [
  { id: "pricing", labelKey: "marketingUI.chat.quick.pricing" },
  { id: "demo", labelKey: "marketingUI.chat.quick.demo" },
  { id: "docs", labelKey: "marketingUI.chat.quick.docs" },
];

export function ChatWidget() {
  const { t } = useTranslation();
  const greeting = React.useMemo<Message>(
    () => ({
      sender: "ai",
      content: t("marketingUI.chat.greeting"),
      at: Date.now(),
    }),
    [t],
  );
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([greeting]);
  const [input, setInput] = React.useState("");
  const [pending, setPending] = React.useState(false);
  /** When set, the visitor is now talking to that team member. */
  const [activeAgent, setActiveAgent] = React.useState<TeamMember | null>(null);
  const [showEscalation, setShowEscalation] = React.useState(false);
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
  }, [messages, pending, showEscalation]);

  /** Surface the "Talk to a human" CTA the moment the AI sends its first
   *  follow-up reply — i.e. once there's a real exchange in flight. */
  const seenAiResponses = React.useMemo(
    () => messages.filter((m) => m.sender === "ai").length,
    [messages],
  );
  React.useEffect(() => {
    if (seenAiResponses >= 2 && !activeAgent) {
      setShowEscalation(true);
    }
  }, [seenAiResponses, activeAgent]);

  const send = async (overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || pending) return;

    const next: Message[] = [
      ...messages,
      { sender: "user", content: trimmed, at: Date.now() },
    ];
    setMessages(next);
    setInput("");
    setPending(true);

    // When a human agent is active, simulate a typed reply rather than
    // hitting Anthropic — the bubble comes from the agent.
    if (activeAgent) {
      window.setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            sender: "agent",
            agentId: activeAgent.id,
            content: t("marketingUI.chat.agentReplyTemplate").replace(
              "{name}",
              t(activeAgent.nameKey),
            ),
            at: Date.now(),
          },
        ]);
        setPending(false);
      }, 900 + Math.random() * 700);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const reply =
        data.reply?.trim() ||
        (data.error
          ? `${t("marketingUI.chat.errorPrefix")}${data.error}`
          : t("marketingUI.chat.modelUnreachable"));
      setMessages((m) => [
        ...m,
        { sender: "ai", content: reply, at: Date.now() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          sender: "ai",
          content: t("marketingUI.chat.networkError"),
          at: Date.now(),
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

  /** Hand off to a team member. Fires a push notification to the operator
   *  console (so an admin sees "live chat request" in real-time), drops an
   *  inline system message, and switches the panel into "agent" mode. */
  const handoff = (member: TeamMember, intent: "sales" | "support" | "direct") => {
    setActiveAgent(member);
    setShowEscalation(false);
    setMessages((m) => [
      ...m,
      {
        sender: "system",
        content: t("marketingUI.chat.handoffSystem")
          .replace("{name}", t(member.nameKey))
          .replace("{role}", t(member.roleKey)),
        at: Date.now(),
      },
      {
        sender: "agent",
        agentId: member.id,
        content: t("marketingUI.chat.agentIntroTemplate")
          .replace("{name}", t(member.nameKey))
          .replace("{intent}", t(`marketingUI.chat.intents.${intent}`)),
        at: Date.now() + 1,
      },
    ]);
    // Real-time alert to the operator surface — the admin app's push banner
    // system picks this up.
    pushNotification({
      severity: "info",
      icon: "spark",
      title: t("marketingUI.chat.notify.title"),
      body: t("marketingUI.chat.notify.body")
        .replace("{name}", t(member.nameKey))
        .replace("{intent}", t(`marketingUI.chat.intents.${intent}`)),
      source: t("marketingUI.chat.notify.source"),
      action: t("marketingUI.chat.notify.action"),
    });
    toast.success(
      t("marketingUI.chat.handoffToast").replace("{name}", t(member.nameKey)),
    );
  };

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        aria-label={open ? t("marketingUI.chat.closeLabel") : t("marketingUI.chat.openLabel")}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full",
          "border border-accent/30 bg-foreground text-background shadow-[0_12px_36px_-12px_rgba(8,10,32,0.6),0_0_28px_-12px_color-mix(in_oklch,var(--accent)_70%,transparent)]",
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
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed bottom-20 right-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden",
              "rounded-2xl border border-accent/15 bg-card/90 backdrop-blur-2xl",
              "shadow-[0_30px_80px_-30px_rgba(8,10,32,0.55),0_0_60px_-30px_color-mix(in_oklch,var(--accent)_55%,transparent)]",
            )}
            style={{ height: "min(34rem, calc(100vh - 7rem))" }}
            role="dialog"
            aria-label={t("marketingUI.chat.dialogLabel")}
          >
            {/* Top accent sheen — same recipe as AuthCard. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent/[0.09] to-transparent"
            />

            {/* Header — swaps between AI and active-agent identity */}
            <Header
              activeAgent={activeAgent}
              onClose={() => setOpen(false)}
            />

            {/* Messages */}
            <div
              ref={scrollRef}
              className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  message={m}
                  agent={
                    m.sender === "agent"
                      ? TEAM.find((tm) => tm.id === m.agentId) ?? null
                      : null
                  }
                />
              ))}
              {pending && (
                <TypingIndicator activeAgent={activeAgent} />
              )}
              {showEscalation && !activeAgent && (
                <EscalationCard onPick={handoff} />
              )}
            </div>

            {/* Quick replies — one-click suggestions above the composer */}
            {!activeAgent && (
              <div className="flex flex-wrap gap-1.5 border-t border-border/40 px-4 pt-2 pb-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => void send(t(q.labelKey))}
                    disabled={pending}
                    className="rounded-full border border-accent/20 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50"
                  >
                    {t(q.labelKey)}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <div className="border-t border-border/60 bg-background/40 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={t("marketingUI.chat.placeholder")}
                  rows={1}
                  className={cn(
                    "max-h-32 min-h-[2.25rem] flex-1 resize-none rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  )}
                  disabled={pending}
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={pending || !input.trim()}
                  aria-label={t("marketingUI.chat.sendLabel")}
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    "bg-accent text-accent-foreground transition-all hover:bg-accent/90 hover:scale-105",
                    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100",
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-muted-foreground">
                <span>{t("marketingUI.chat.disclaimer")}</span>
                <TeamOnlineHint />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Header — AI or live-agent identity                                  */
/* ─────────────────────────────────────────────────────────────────── */

function Header({
  activeAgent,
  onClose,
}: {
  activeAgent: TeamMember | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="relative flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      {activeAgent ? (
        <div className="flex items-center gap-2.5">
          <AgentAvatar member={activeAgent} size="md" pulse />
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t(activeAgent.nameKey)}</div>
            <div className="text-[10px] text-muted-foreground">
              {t(activeAgent.roleKey)} ·{" "}
              <span className="text-[color:var(--success)]">
                {t("marketingUI.chat.replyingNow")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-2 w-2 rounded-full border-2 border-card bg-[color:var(--success)]" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t("marketingUI.chat.title")}</div>
            <div className="text-[10px] text-muted-foreground">
              {t("marketingUI.chat.status")}
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-label={t("marketingUI.chat.closeButton")}
        onClick={onClose}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Escalation card — appears after the AI's first follow-up reply      */
/* ─────────────────────────────────────────────────────────────────── */

function EscalationCard({
  onPick,
}: {
  onPick: (member: TeamMember, intent: "sales" | "support" | "direct") => void;
}) {
  const { t } = useTranslation();
  const [maya, jordan, sofia] = TEAM;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-accent/20 bg-background/50 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("marketingUI.chat.escalation.heading")}
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] text-[color:var(--success)]">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
          </span>
          {t("marketingUI.chat.escalation.online").replace("{count}", String(TEAM.length))}
        </span>
      </div>

      <p className="mb-3 text-xs text-foreground/90">
        {t("marketingUI.chat.escalation.prompt")}
      </p>

      {/* Avatar row + small clickable handoff per member */}
      <div className="mb-3 flex items-center gap-2">
        {TEAM.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m, "direct")}
            title={t(m.nameKey)}
            className="group flex flex-col items-center gap-1"
          >
            <AgentAvatar member={m} size="md" pulse />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
              {t(m.nameKey).split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Sales / Support split-CTA */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onPick(maya, "sales")}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/20"
        >
          <Headphones className="h-3.5 w-3.5 text-accent" />
          {t("marketingUI.chat.escalation.sales")}
        </button>
        <button
          type="button"
          onClick={() => onPick(jordan ?? sofia, "support")}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent/30"
        >
          <LifeBuoy className="h-3.5 w-3.5 text-[color:var(--success)]" />
          {t("marketingUI.chat.escalation.support")}
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Message bubble — AI / user / system / agent variants                */
/* ─────────────────────────────────────────────────────────────────── */

function MessageBubble({
  message,
  agent,
}: {
  message: Message;
  agent: TeamMember | null;
}) {
  const { t } = useTranslation();
  if (message.sender === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full border border-border/60 bg-background/40 px-2.5 py-0.5 text-[10px] text-muted-foreground">
          {message.content}
        </span>
      </div>
    );
  }

  const isUser = message.sender === "user";
  return (
    <div className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <>
          {agent ? (
            <AgentAvatar member={agent} size="sm" />
          ) : (
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          )}
        </>
      )}
      <div className="max-w-[80%]">
        <div
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed",
            isUser
              ? "rounded-br-sm bg-accent text-accent-foreground"
              : "rounded-bl-sm bg-secondary text-foreground",
          )}
        >
          {message.content}
        </div>
        <div
          className={cn(
            "mt-1 text-[10px] text-muted-foreground/70",
            isUser ? "text-right" : "text-left",
          )}
        >
          {isUser
            ? t("marketingUI.chat.you")
            : agent
              ? t(agent.nameKey)
              : t("marketingUI.chat.aiSender")}{" "}
          · {formatTime(message.at)}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Typing indicator — three pulsing dots                               */
/* ─────────────────────────────────────────────────────────────────── */

function TypingIndicator({ activeAgent }: { activeAgent: TeamMember | null }) {
  return (
    <div className="flex items-end gap-2">
      {activeAgent ? (
        <AgentAvatar member={activeAgent} size="sm" />
      ) : (
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground"
            style={{
              animation: "chat-dot-pulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <style jsx global>{`
        @keyframes chat-dot-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.9); }
          40%            { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Team online hint at the bottom of the panel                         */
/* ─────────────────────────────────────────────────────────────────── */

function TeamOnlineHint() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex -space-x-1.5">
        {TEAM.map((m) =>
          m.avatar ? (
            <img
              key={m.id}
              src={m.avatar}
              alt=""
              title={t(m.nameKey)}
              loading="lazy"
              className="h-3.5 w-3.5 rounded-full border border-card object-cover"
            />
          ) : (
            <span
              key={m.id}
              className={cn(
                "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-card text-[7px] font-semibold",
                TONE_BG[m.tone],
              )}
              title={t(m.nameKey)}
            >
              {m.initials.slice(0, 1)}
            </span>
          ),
        )}
      </span>
      <span>
        {t("marketingUI.chat.teamOnline").replace("{count}", String(TEAM.length))}
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Agent avatar — colored circle + initials + optional online dot       */
/* ─────────────────────────────────────────────────────────────────── */

function AgentAvatar({
  member,
  size = "sm",
  pulse,
}: {
  member: TeamMember;
  size?: "sm" | "md";
  pulse?: boolean;
}) {
  const sizeCls = size === "md" ? "h-8 w-8 text-[10px]" : "h-7 w-7 text-[9px]";
  // Photo failed to decode → fall back to initials so the chip never blanks.
  const [imgFailed, setImgFailed] = React.useState(false);
  return (
    <span className="relative inline-flex">
      {member.avatar && !imgFailed ? (
        <img
          src={member.avatar}
          alt=""
          loading="lazy"
          onError={() => setImgFailed(true)}
          className={cn(
            "rounded-full object-cover ring-1 ring-border/60",
            sizeCls,
          )}
        />
      ) : (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full font-bold",
            sizeCls,
            TONE_BG[member.tone],
          )}
        >
          {member.initials}
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-0.5 -right-0.5 inline-flex h-2 w-2 rounded-full border-2 border-card bg-[color:var(--success)]",
          pulse && "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-[color:var(--success)] after:opacity-70",
        )}
      />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Helpers                                                              */
/* ─────────────────────────────────────────────────────────────────── */

function formatTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${m} ${period}`;
}
