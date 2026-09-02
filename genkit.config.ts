import { defineConfig } from "@genkit-ai/core"
import { googleAI } from "@genkit-ai/google-genai"

export default defineConfig({
  plugins: [
    googleAI({
      // Ensures Genkit pulls your key correctly from environment variables
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY ||  process.env.GROQ_API_KEY,
    }),
  ],
  logLevel: "debug",
})
