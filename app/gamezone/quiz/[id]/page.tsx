"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  Trophy, 
  ArrowLeft, 
  RotateCcw 
} from "lucide-react"
import { recordActivity } from "@/lib/activity"
import { quizData } from "@/lib/quiz-data"
import { getAvailableQuestions, getQuizAttempts } from "@/lib/quiz-tracking"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// --- TYPES ---
type QuestionResult = {
  question: string
  userAnswer: number | null
  correctAnswer: number
  isCorrect: boolean
  explanation: string
  options: string[]
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  // State
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false) // Show immediate feedback
  const [quizCompleted, setQuizCompleted] = useState(false)
  
  // Timer (10 Minutes = 600s)
  const [timeLeft, setTimeLeft] = useState(600)
  
  // Data State
  const [questionOrder, setQuestionOrder] = useState<number[]>([])
  const [attemptNumber, setAttemptNumber] = useState(1)
  
  // Results Tracking
  const [results, setResults] = useState<QuestionResult[]>([])
  
  const quiz = quizData[quizId]

  // --- INITIALIZATION ---
  useEffect(() => {
    if (!quiz) return

    try {
      // Mock User ID (Replace with real auth ID if available)
      const userId = "current_user" 
      
      // Get Randomized Questions
      const availableQuestions = getAvailableQuestions(userId, quizId, quiz.questions.length)
      const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5)
      setQuestionOrder(shuffled)

      // Get Attempt Count
      const attempts = getQuizAttempts(userId, quizId)
      setAttemptNumber(attempts.length + 1)
    } catch (error) {
      console.error("Error initializing quiz:", error)
    }
  }, [quiz, quizId])

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (quizCompleted || !questionOrder.length) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          finishQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizCompleted, questionOrder])

  // --- ACTIONS ---

  const handleAnswerSelect = (index: number) => {
    if (!isAnswerChecked) {
      setSelectedAnswer(index)
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    
    setIsAnswerChecked(true)
    const currentQIndex = questionOrder[currentQuestion]
    const currentQ = quiz.questions[currentQIndex]
    const isCorrect = selectedAnswer === currentQ.correctAnswer

    // ⚡ PENALTY LOGIC
    if (!isCorrect) {
      setTimeLeft((prev) => Math.max(0, prev - 10)) // Deduct 10s
    }

    // Record Result for Report
    const newResult: QuestionResult = {
      question: currentQ.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      explanation: currentQ.explanation,
      options: currentQ.options
    }
    
    setResults([...results, newResult])
  }

  const handleNext = () => {
    if (currentQuestion < questionOrder.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setIsAnswerChecked(false)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    setQuizCompleted(true)
    
    // Calculate Score
    const correctCount = results.filter(r => r.isCorrect).length
    const score = Math.round((correctCount / questionOrder.length) * 100)

    // Save to Firebase
    try {
      await recordActivity({
        type: "quiz",
        description: `Quiz: ${quiz.title} (${score}%)`,
        points: score * 5, // 5 points per % (max 500)
      })
    } catch (err) {
      console.error("Failed to save quiz:", err)
    }
  }

  // --- LOADING STATE ---
  if (!quiz || questionOrder.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        Loading Cyber Assessment...
      </div>
    )
  }

  // --- HELPER: TIME FORMAT ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // ==============================
  // 🏁 FINAL REPORT UI
  // ==============================
  if (quizCompleted) {
    const correctCount = results.filter(r => r.isCorrect).length
    const score = Math.round((correctCount / questionOrder.length) * 100)
    const passed = score >= 70

    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <Card className={`text-center border-t-4 ${passed ? "border-t-green-500" : "border-t-red-500"}`}>
            <CardHeader>
              <CardTitle className="text-3xl flex items-center justify-center gap-3">
                {passed ? <Trophy className="h-8 w-8 text-yellow-500" /> : <AlertTriangle className="h-8 w-8 text-red-500" />}
                Assessment Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold mb-2">{score}%</div>
              <p className="text-muted-foreground mb-6">
                You answered {correctCount} out of {questionOrder.length} correctly.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push("/gamezone")} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to GameZone
                </Button>
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Retry Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Detailed Report</h2>
            {results.map((res, idx) => (
              <Card key={idx} className={`border-l-4 ${res.isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">Q{idx + 1}: {res.question}</h3>
                    {res.isCorrect ? <CheckCircle className="text-green-500 h-6 w-6" /> : <XCircle className="text-red-500 h-6 w-6" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className={res.isCorrect ? "text-green-500" : "text-red-500"}>
                        <span className="font-bold">Your Answer:</span> {res.options[res.userAnswer!]}
                     </div>
                     <div className="text-green-500">
                        <span className="font-bold">Correct Answer:</span> {res.options[res.correctAnswer]}
                     </div>
                  </div>
                  <div className="bg-muted p-3 rounded mt-2">
                    <span className="font-bold text-primary">Explanation:</span> {res.explanation}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ==============================
  // 🎮 QUIZ INTERFACE
  // ==============================
  const currentQIndex = questionOrder[currentQuestion]
  const currentQ = quiz.questions[currentQIndex]
  const progress = ((currentQuestion) / questionOrder.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Bar: Exit + Timer + Attempt */}
        <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-red-500">
            <Link href="/gamezone">
              <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
            </Link>
          </Button>
          
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-center">
               <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Attempt</span>
               <span className="font-mono font-bold text-primary">{attemptNumber}</span>
             </div>
             <div className="h-8 w-px bg-border" />
             <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary"}`}>
               <Clock className="h-5 w-5" />
               {formatTime(timeLeft)}
             </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase">
             <span>Progress</span>
             <span>Question {currentQuestion + 1} / {questionOrder.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card (Animated) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="mb-2">{currentQ.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground">Points: 10</span>
                </div>
                <h2 className="text-2xl font-bold leading-tight">{currentQ.question}</h2>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {currentQ.options.map((option, idx) => {
                    // Logic for coloring options AFTER submit
                    let btnClass = "justify-start text-left h-auto py-4 text-base border-2 hover:bg-accent hover:text-accent-foreground"
                    
                    if (isAnswerChecked) {
                      if (idx === currentQ.correctAnswer) btnClass = "justify-start text-left h-auto py-4 text-base border-2 bg-green-500/10 border-green-500 text-green-500"
                      else if (idx === selectedAnswer && idx !== currentQ.correctAnswer) btnClass = "justify-start text-left h-auto py-4 text-base border-2 bg-red-500/10 border-red-500 text-red-500"
                      else btnClass = "justify-start text-left h-auto py-4 text-base border-2 opacity-50"
                    } else if (selectedAnswer === idx) {
                      btnClass = "justify-start text-left h-auto py-4 text-base border-2 border-primary bg-primary/5 ring-1 ring-primary"
                    }

                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        className={btnClass}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={isAnswerChecked}
                      >
                        <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </Button>
                    )
                  })}
                </div>

                {/* Feedback Section */}
                {isAnswerChecked && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${selectedAnswer === currentQ.correctAnswer ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {selectedAnswer === currentQ.correctAnswer ? (
                        <><CheckCircle className="h-5 w-5 text-green-500" /> Correct!</>
                      ) : (
                        <><XCircle className="h-5 w-5 text-red-500" /> Incorrect (-10s Penalty)</>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
                  </motion.div>
                )}

              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Action Button */}
        <div className="flex justify-end">
          {!isAnswerChecked ? (
            <Button 
              size="lg" 
              onClick={handleSubmitAnswer} 
              disabled={selectedAnswer === null}
              className="w-full md:w-auto px-8"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={handleNext} 
              className="w-full md:w-auto px-8"
            >
              {currentQuestion < questionOrder.length - 1 ? (
                <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                <>View Report <Trophy className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}