import { NextResponse } from "next/server";

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are Avortyx AI, the friendly assistant embedded on the Avortyx landing page.

Avortyx is a real-time pay-per-call routing and intelligence platform for
modern call networks. It combines:
  • Live call routing between publishers, buyers, and destinations
  • AI-driven optimization and anomaly detection
  • Daily news + live crypto market feeds inside one workspace
  • Marketplace for buying and selling inbound call inventory
  • Full reporting, KYC / Trust Engine, and integrations

Keep replies short (1–3 short paragraphs), warm, and helpful. If the user
asks about Avortyx specifically, point them toward signing up free or
booking a demo. If they want to talk to a human, mention that Maya (sales),
Jordan (solutions), or Lina (customer success) are available in this chat —
they can pick a person and the team will jump in here.

NEVER mention any other brand name. NEVER refer to Avortyx as a "lead
generation agency" or "web development agency" — it is a call-tracking and
routing platform. Otherwise answer general questions naturally.`;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  console.log(">>> GROQ_API_KEY loaded:", apiKey ? "YES ✅" : "NO ❌");

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GROQ_API_KEY." },
      { status: 500 }
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
      m.content.trim().length > 0
  );

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages." }, { status: 400 });
  }

  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20),
        ],
      }),
    });

    console.log(">>> Groq response status:", upstream.status);

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error(">>> Groq error detail:", detail);
      return NextResponse.json(
        { error: "Upstream error.", detail },
        { status: 502 }
      );
    }

    const data = await upstream.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

    console.log(">>> Reply generated:", reply ? "YES ✅" : "EMPTY ❌");

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(">>> Network error:", err);
    return NextResponse.json(
      { error: "Network error.", detail: String(err) },
      { status: 502 }
    );
  }
}