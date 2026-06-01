/**
 * /api/chat — proxies landing-page chat requests to the Anthropic API.
 *
 * The browser POSTs `{ messages: [{ role, content }, …] }` and gets back
 * `{ reply: "…assistant text…" }`. The API key never leaves the server.
 *
 * Env: ANTHROPIC_API_KEY (required)
 */

import { NextResponse } from "next/server";

export const runtime = "edge";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 512;

const SYSTEM_PROMPT = `You are Vortyx AI, the friendly assistant embedded on the Vortyx landing page.
Vortyx is a pay-per-call routing platform for buyers, publishers, and call centers.
Keep replies short (1–3 short paragraphs), warm, and helpful. If the user asks
about Vortyx specifically, point them toward signing up or booking a demo.
Otherwise answer general questions naturally.`;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const messages = (body.messages ?? []).filter(
    (m): m is IncomingMessage =>
      !!m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  );

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages." }, { status: 400 });
  }

  const trimmed = messages.slice(-20);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return NextResponse.json(
        { error: "Upstream error.", detail },
        { status: 502 },
      );
    }

    const data = (await upstream.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const reply =
      data.content?.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim() ??
      "";

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: "Network error.", detail: String(err) },
      { status: 502 },
    );
  }
}
