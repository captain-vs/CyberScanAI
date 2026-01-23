import * as z from "zod";
import { genkit } from "genkit";
import Groq from "groq-sdk";

// 1. Initialize Genkit
const ai = genkit({});

// 2. Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, 
});

// 3. Define the Schema (Added aiDetection field)
const ScanResultSchema = z.object({
  status: z.enum(["Clean", "Warning", "Malicious"]),
  description: z.string(),
  threatExplanation: z.string(),
  recommendations: z.string(),
  vendors: z.array(z.object({ name: z.string(), result: z.string() })),
  // NEW: AI Detection Field
  aiDetection: z.object({
    isAiGenerated: z.boolean(),
    confidenceScore: z.number().min(0).max(100),
    reasoning: z.string()
  }).optional(),
  analysis: z.object({
    ipAddress: z.string().optional(),
    hostname: z.string().optional(),
    country: z.string().optional(),
    sslCertificate: z.string().optional(),
    details: z.array(z.object({ label: z.string(), value: z.string() })),
    requestHeaders: z.array(z.object({ header: z.string(), value: z.string() })).optional(),
    responseHeaders: z.array(z.object({ header: z.string(), value: z.string() })).optional(),
  }).optional(),
});

export const securityScanFlow = ai.defineFlow(
  {
    name: "securityScan",
    inputSchema: z.object({
      target: z.string(),
      type: z.enum(["URL", "IP", "File", "Image"]),
      imageBase64: z.string().optional(), // NEW: Accepts image data
    }),
    outputSchema: ScanResultSchema,
  },
  async (input) => {
    const { target, type, imageBase64 } = input;
    console.log(`🚀 Groq Scanning: ${type} -> ${target}`);

    // --- STRATEGY: VISION SCAN vs TEXT SCAN ---

    // 🅰️ VISION PATH (If it's an Image with Data)
    if (type === "Image" && imageBase64) {
      try {
        console.log("👁️ Using Vision Model (Llama 3.2 90b)...");
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: `Analyze this image for security threats and AI Generation artifacts.
                  
                  TASK:
                  1. Check for AI artifacts (distorted hands, weird text, plastic skin).
                  2. Check for Steganography noise patterns.
                  3. Check metadata/file signatures if visible.

                  Return valid JSON matching this schema:
                  {
                    "status": "Clean" | "Warning" | "Malicious",
                    "description": "Summary of visual findings",
                    "threatExplanation": "Detailed visual analysis",
                    "recommendations": "Actionable advice",
                    "vendors": [{"name": "Vision AI", "result": "Clean"}],
                    "aiDetection": {
                       "isAiGenerated": boolean,
                       "confidenceScore": number (0-100),
                       "reasoning": "Visual evidence found..."
                    },
                    "analysis": { 
                      "details": [{"label": "Resolution", "value": "Analyzed from Image"}] 
                    }
                  }` 
                },
                {
                  type: "image_url",
                  image_url: { url: imageBase64 } // 📸 The actual pixels
                }
              ]
            }
          ],
          model: "llama-3.2-90b-vision-preview",
          temperature: 0.1,
          response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content || "{}";
        return JSON.parse(content);

      } catch (error: any) {
        console.error("❌ Vision Model Failed:", error.message);
        // Fall through to text fallback (metadata scan)
      }
    }

    // 🅱️ TEXT/METADATA PATH (Standard Scan)
    const modelsToTry = [
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`🤖 Attempting scan with model: ${modelName}...`);

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are an elite cybersecurity threat analyst.
              Analyze this ${type}: "${target}".
              
              Generate a detailed security report. If it's a URL, provide realistic (but simulated) request/response headers, IP, and SSL info. For files/IPs, provide relevant details.
              
              Return ONLY valid JSON. No markdown.
              
              JSON Schema:
              {
                "status": "Clean" | "Warning" | "Malicious",
                "description": "Brief summary",
                "threatExplanation": "Detailed analysis",
                "recommendations": "Actionable steps",
                "vendors": [
                  {"name": "Pattern Analysis", "result": "Clean/Malicious"},
                  {"name": "SSL Check", "result": "Clean/Warning/N/A"},
                  {"name": "Domain Reputation", "result": "Clean/Malicious/N/A"},
                  {"name": "VirusTotal", "result": "Clean/Malicious"}
                ],
                "aiDetection": {
                   "isAiGenerated": boolean,
                   "confidenceScore": number (0-100),
                   "reasoning": "Based on metadata/naming analysis"
                },
                "analysis": {
                  "ipAddress": "Simulated IP or N/A",
                  "hostname": "Extracted hostname or N/A",
                  "country": "Simulated Country or N/A",
                  "sslCertificate": "Simulated status or N/A",
                  "details": [{"label": "Feature", "value": "Detail"}],
                  "requestHeaders": [{"header": "Header-Name", "value": "Header-Value"}],
                  "responseHeaders": [{"header": "Header-Name", "value": "Header-Value"}]
                }
              }`
            },
            {
              role: "user",
              content: `Analyze this ${type}: "${target}"`
            }
          ],
          model: modelName, 
          temperature: 0.3, 
          response_format: { type: "json_object" } 
        });

        const content = completion.choices[0]?.message?.content || "{}";
        return JSON.parse(content);

      } catch (error: any) {
        if (error.status === 400 || error.status === 404 || error.code === 'model_decommissioned') {
           console.warn(`⚠️ Model ${modelName} unavailable. Trying next...`);
           continue;
        }
        console.error("❌ Groq Error:", error.message);
        break;
      }
    }

    // Fallback
    return {
      status: "Warning",
      description: "Scan Completed with Heuristics (AI Error)",
      threatExplanation: "All available AI models are currently unreachable.",
      recommendations: "Verify connectivity and try again.",
      vendors: [{ name: "System", result: "Error" }],
      analysis: {
        details: [{ label: "Target", value: target }, { label: "Error", value: "All Models Failed" }]
      }
    };
  }
);

export default securityScanFlow;