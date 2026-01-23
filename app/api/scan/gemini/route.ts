import { NextResponse } from "next/server";
import { securityScanFlow } from "@/src/index";

export async function POST(req: Request) {
  const timestamp = new Date().toLocaleTimeString();
  
  try {
    const body = await req.json();
    const { target, type } = body;

    console.log(`\n\x1b[36m[${timestamp}] 🚀 INITIATING SCAN: ${type} -> ${target}\x1b[0m`);

    if (!target) {
      console.log(`\x1b[31m[${timestamp}] ❌ ERROR: Missing target\x1b[0m`);
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    // Call Genkit Flow
    console.log(`\x1b[33m[${timestamp}] ⏳ Calling Genkit AI Model...\x1b[0m`);
    const result = await securityScanFlow({ target, type: type || "URL" });

    // Log success or fallback
    if (result.description.includes("AI Unavailable")) {
      console.log(`\x1b[31m[${timestamp}] ⚠️ AI FAILED. Serving Heuristic Fallback Data.\x1b[0m`);
    } else {
      console.log(`\x1b[32m[${timestamp}] ✅ SUCCESS: AI Analysis Complete.\x1b[0m`);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`\x1b[31m[${timestamp}] 🔥 CRITICAL API ERROR:\x1b[0m`, error.message);
    return NextResponse.json(
      { error: "Scan Failed", details: error.message },
      { status: 500 }
    );
  }
}