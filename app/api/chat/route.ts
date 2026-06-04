import { NextResponse } from "next/server";

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are Keozx AI, the friendly assistant embedded on the Keozx landing page.
Keozx is a lead generation and web development agency for ambitious brands.
Keep replies short (1–3 short paragraphs), warm, and helpful. If the user asks
about Keozx specifically, point them toward signing up or booking a demo.
Otherwise answer general questions naturally.`;

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