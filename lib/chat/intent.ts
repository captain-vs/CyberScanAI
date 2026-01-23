export type Intent =
  | "platform"
  | "cyber"
  | "ai-cyber"
  | "unknown"

export function detectIntent(question: string): Intent {
  const q = question.toLowerCase()

  if (q.includes("cyberscan")) return "platform"

  if (
    q.includes("ai") ||
    q.includes("artificial intelligence") ||
    q.includes("machine learning") ||
    q.includes("neural") ||
    q.includes("automation")
  ) {
    return "ai-cyber"
  }

  return "cyber"
}
