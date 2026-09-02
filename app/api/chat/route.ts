import { NextResponse } from "next/server"
import { knowledgeBase } from "@/lib/chat/knowledge-base"
import { isCyberDomain } from "@/lib/chat/domain-guard"
import { detectIntent } from "@/lib/chat/intent"

export async function POST(req: Request) {
  try {
    const { question } = await req.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ answer: "Invalid question." })
    }

    const q = question.toLowerCase()

  /* ---------------------------------------
   3️⃣ KNOWLEDGE BASE (ALWAYS FIRST)
--------------------------------------- */
for (const item of knowledgeBase) {
  if (item.keywords.some((k) => q.includes(k))) {
    console.log("📘 ANSWERED BY: Knowledge Base")
    return NextResponse.json({ answer: item.answer })
  }
}




    /* ---------------------------------------
       1️⃣ DOMAIN GUARD
    --------------------------------------- */
    if (!isCyberDomain(q)) {
      console.log("🚫 BLOCKED: Out-of-domain")
      return NextResponse.json({
        answer:
          "I can only assist with cybersecurity and SecurityX related topics.",
      })
    }

    /* ---------------------------------------
       2️⃣ INTENT DETECTION
    --------------------------------------- */
    const intent = detectIntent(q)
    console.log("🎯 INTENT:", intent)

    /* ---------------------------------------
       3️⃣ KNOWLEDGE BASE (PLATFORM / CORE)
    --------------------------------------- */


    /* ---------------------------------------
       4️⃣ GROQ AI (CONTROLLED FALLBACK)
    --------------------------------------- */
    console.log("🤖 FALLBACK TO: Groq AI")
const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: `
You are SecurityX Assistant.

Answer rules:
- Keep answers short (4–6 lines max)
- Use simple language for beginners
- No long paragraphs
- No unnecessary theory
- Focus on awareness and defense only

Scope:
- Cybersecurity basics
- OSINT awareness
- AI in cybersecurity (high-level)
- Online safety and privacy
              `,
            },
            {
              role: "user",
              content: question,
            },
          ],
          temperature: 0.3,
          max_tokens: 180,
        }),
      }
    )

    const data = await groqRes.json()

    if (!groqRes.ok) {
      console.error("❌ GROQ FAILED:", data)
      throw new Error("Groq failed")
    }

    const answer = data?.choices?.[0]?.message?.content

    if (!answer) throw new Error("Empty Groq response")

    console.log("✅ ANSWERED BY: Groq AI")
    return NextResponse.json({ answer })

  } catch (error) {
    console.error("⚠️ CHAT API ERROR:", error)

    return NextResponse.json({
      answer:
        "I couldn’t generate an answer right now. Please explore the Scan, OSINT, or Learn sections.",
    })
  }
}
