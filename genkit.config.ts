import { defineConfig } from "@genkit-ai/core"
import { googleAI } from "@genkit-ai/google-genai"

export default defineConfig({
  plugins: [googleAI()],
  logLevel: "debug",
})
