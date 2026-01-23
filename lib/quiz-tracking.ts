export interface QuizAttempt {
  quizId: string
  attemptNumber: number
  usedQuestionIds: number[]
  completedAt: string
}

export function getQuizAttempts(userId: string, quizId: string): QuizAttempt[] {
  if (typeof window === "undefined") return []
  try {
    const key = `quiz_attempts_${userId}_${quizId}`
    return JSON.parse(localStorage.getItem(key) || "[]")
  } catch {
    return []
  }
}

export function recordQuizAttempt(userId: string, quizId: string, usedQuestionIds: number[]) {
  if (typeof window === "undefined") return

  try {
    const attempts = getQuizAttempts(userId, quizId)
    const newAttempt: QuizAttempt = {
      quizId,
      attemptNumber: attempts.length + 1,
      usedQuestionIds,
      completedAt: new Date().toISOString(),
    }
    attempts.push(newAttempt)
    const key = `quiz_attempts_${userId}_${quizId}`
    localStorage.setItem(key, JSON.stringify(attempts))
  } catch (error) {
    console.error("[v0] Failed to record quiz attempt:", error)
  }
}

export function getAvailableQuestions(userId: string, quizId: string, totalQuestions: number) {
  const attempts = getQuizAttempts(userId, quizId)

  // First attempt - all questions available
  if (attempts.length === 0) {
    return Array.from({ length: totalQuestions }, (_, i) => i)
  }

  // After 2-3 attempts, all questions become available again
  if (attempts.length >= 3) {
    return Array.from({ length: totalQuestions }, (_, i) => i)
  }

  // Between 1-2 attempts, exclude previously used questions
  const usedQuestionIds = new Set<number>()
  attempts.forEach((attempt) => {
    attempt.usedQuestionIds.forEach((id) => usedQuestionIds.add(id))
  })

  return Array.from({ length: totalQuestions }, (_, i) => i).filter((i) => !usedQuestionIds.has(i))
}
