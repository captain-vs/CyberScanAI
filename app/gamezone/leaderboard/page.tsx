"use client"

import {
  Gamepad2,
  Trophy,
  CheckCircle,
  Star,
  ArrowRight,
  Target,
  Shield,
  Code,
  Network,
  Terminal,
  Loader2,
  Filter,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { motion, AnimatePresence } from "framer-motion" // ⚡ IMPORTED FRAMER MOTION

// --- DATA ---
type Challenge = {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
  category: string
}

const challengesList: Challenge[] = [
  { id: "c1", title: "Password Cracking Basics", description: "Analyze weak passwords.", difficulty: "Easy", points: 100, category: "Authentication" },
  { id: "c2", title: "Network Traffic Analysis", description: "Analyze captured packets.", difficulty: "Medium", points: 250, category: "Network Security" },
  { id: "c3", title: "SQL Injection Challenge", description: "Exploit simulated DB.", difficulty: "Medium", points: 300, category: "Web Security" },
  { id: "c4", title: "XSS Attack Simulation", description: "Identify XSS flaws.", difficulty: "Medium", points: 280, category: "Web Security" },
  { id: "c5", title: "API Security Testing", description: "Bypass API auth.", difficulty: "Medium", points: 320, category: "API Security" },
  { id: "c6", title: "Privilege Escalation Lab", description: "Gain admin rights.", difficulty: "Hard", points: 450, category: "System Security" },
  { id: "c7", title: "Reverse Engineering", description: "Decompile binary.", difficulty: "Hard", points: 500, category: "Malware Analysis" },
  { id: "c8", title: "Cryptography Puzzle", description: "Decrypt layers.", difficulty: "Hard", points: 400, category: "Cryptography" },
  { id: "c9", title: "Social Engineering Defense", description: "Identify phishing.", difficulty: "Easy", points: 150, category: "Social Engineering" },
  { id: "c10", title: "Container Security", description: "Docker escape.", difficulty: "Hard", points: 480, category: "Cloud Security" },
  { id: "c11", title: "IoT Device Hacking", description: "Default creds.", difficulty: "Medium", points: 290, category: "IoT Security" },
  { id: "c12", title: "Blockchain Security", description: "Smart contract bugs.", difficulty: "Hard", points: 520, category: "Blockchain" },
  { id: "c13", title: "Cloud Misconfiguration", description: "S3 buckets.", difficulty: "Medium", points: 310, category: "Cloud Security" },
  { id: "c14", title: "Wireless Hacking", description: "Crack WPA2.", difficulty: "Hard", points: 470, category: "Network Security" },
  { id: "c15", title: "Mobile App Security", description: "Decompile APK.", difficulty: "Medium", points: 300, category: "Mobile Security" },
  { id: "l1", title: "Linux Basics: File Hunt", description: "Navigate directories.", difficulty: "Easy", points: 150, category: "Linux Terminal" },
  { id: "l2", title: "Linux Permissions", description: "Fix file permissions.", difficulty: "Medium", points: 250, category: "Linux Terminal" },
  { id: "l3", title: "Linux Grep", description: "Search logs.", difficulty: "Medium", points: 300, category: "Linux Terminal" },
]

const quizzes = [
  { id: "q1", title: "Cybersecurity Fundamentals", questions: 20, difficulty: "Beginner" },
  { id: "q2", title: "Network Security Protocols", questions: 25, difficulty: "Intermediate" },
  { id: "q3", title: "Advanced Threat Detection", questions: 30, difficulty: "Advanced" },
]

// ⚡ ANIMATED NUMBER COMPONENT
function CountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return
    const duration = 1500
    const incrementTime = (duration / end) * 10
    const timer = setInterval(() => {
      start += Math.ceil(end / 50)
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)
    return () => clearInterval(timer)
  }, [value])
  return <span>{count}</span>
}

export default function GameZonePage() {
  const [stats, setStats] = useState({ points: 0, challengesCompleted: 0, level: 1 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All") // ⚡ FILTER STATE

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return setLoading(false)
      const unsubDoc = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setStats(data.stats || { points: 0, challengesCompleted: 0, level: 1 })
        }
        setLoading(false)
      })
      return () => unsubDoc()
    })
    return () => unsubAuth()
  }, [])

  // ⚡ FILTER LOGIC
  const categories = ["All", "Linux Terminal", "Web Security", "Network Security", "Cryptography"]
  const filteredChallenges = filter === "All" 
    ? challengesList 
    : challengesList.filter(c => c.category === filter)

  // ⚡ HELPER FOR ICONS
  const getCategoryIcon = (cat: string) => {
    if (cat.includes("Linux")) return <Terminal className="h-4 w-4" />
    if (cat.includes("Web")) return <Code className="h-4 w-4" />
    if (cat.includes("Network")) return <Network className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  const getDifficultyColor = (diff: string) => {
    if (diff === "Easy") return "text-green-500 bg-green-500/10 border-green-500/20"
    if (diff === "Medium") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    return "text-red-500 bg-red-500/10 border-red-500/20"
  }

  const nextLevelPoints = stats.level * 1000

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black">
        <div className="container mx-auto px-4 py-12">
          
          {/* ⚡ HERO SECTION WITH ANIMATION */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-400 to-secondary">
              GameZone
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Engage in high-stakes cyber simulations. Hack, defend, and climb the global leaderboard.
            </p>
          </motion.div>

          {/* ⚡ ANIMATED STATS BAR */}
          <div className="mb-12 grid gap-6 md:grid-cols-4">
             <StatCard icon={Zap} value={<CountUp value={stats.points} />} label="Total Points" color="primary" />
             <StatCard icon={CheckCircle} value={<CountUp value={stats.challengesCompleted} />} label="Completed" color="secondary" />
             <StatCard icon={Trophy} value={`#${stats.points > 0 ? "142" : "-"}`} label="Global Rank" color="accent" />
             
             {/* LEVEL PROGRESS */}
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2 }}
             >
               <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-pulse" />
                 <CardContent className="p-6">
                   <div className="mb-2 flex justify-between text-sm font-bold">
                     <span className="text-primary">Level {stats.level}</span>
                     <span>{stats.points}/{nextLevelPoints} XP</span>
                   </div>
                   <Progress value={(stats.points / nextLevelPoints) * 100} className="h-2 bg-slate-800" />
                 </CardContent>
               </Card>
             </motion.div>
          </div>

          {/* ⚡ INTERACTIVE FILTERS */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className="rounded-full transition-all duration-300"
                size="sm"
              >
                {filter === cat && <Filter className="mr-2 h-3 w-3" />}
                {cat}
              </Button>
            ))}
          </div>

          {/* ⚡ CHALLENGES GRID (LAYOUT ANIMATION) */}
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-bold flex items-center gap-2">
              <Target className="text-primary" /> Active Challenges
            </h2>
            
            <motion.div 
              layout 
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence>
                {filteredChallenges.map((c) => (
                  <motion.div
                    layout
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(79, 143, 255, 0.2)" }}
                  >
                    <Card className="h-full border-primary/10 bg-slate-900/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="flex items-center gap-1 bg-slate-900">
                            {getCategoryIcon(c.category)} {c.category}
                          </Badge>
                          <Badge className={getDifficultyColor(c.difficulty)}>{c.difficulty}</Badge>
                        </div>
                        <CardTitle className="text-xl">{c.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mt-auto">
                           <Badge variant="secondary" className="font-mono">{c.points} XP</Badge>
                           <Button size="sm" asChild className="group-hover:bg-primary">
                             <Link href={`/gamezone/challenge/${c.id}`}>Start <ArrowRight className="ml-2 h-3 w-3" /></Link>
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ⚡ QUIZZES SECTION */}
          <div>
            <h2 className="mb-6 text-3xl font-bold flex items-center gap-2">
              <Gamepad2 className="text-secondary" /> Quick Quizzes
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
               {quizzes.map((q, i) => (
                 <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                 >
                   <Card className="border-secondary/20 bg-slate-900/50 hover:bg-secondary/5 transition-colors">
                     <CardHeader>
                       <CardTitle>{q.title}</CardTitle>
                       <CardDescription>{q.difficulty} • {q.questions} Questions</CardDescription>
                     </CardHeader>
                     <CardContent>
                       <Button variant="outline" className="w-full border-secondary/50 text-secondary hover:bg-secondary hover:text-white" asChild>
                         <Link href={`/gamezone/quiz/${q.id}`}>Take Quiz</Link>
                       </Button>
                     </CardContent>
                   </Card>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* ACHIEVEMENTS LINK */}
          <motion.div whileHover={{ scale: 1.01 }} className="mt-16">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-10 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-primary animate-bounce" />
                <h2 className="text-2xl font-bold mb-2">Unlock Achievements</h2>
                <p className="text-muted-foreground mb-6">Track your progress and earn badges on your profile.</p>
                <Button size="lg" asChild className="shadow-lg shadow-primary/20">
                  <Link href="/profile">View Achievements</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </AuthGuard>
  )
}

// ⚡ ANIMATED STAT CARD
function StatCard({ icon: Icon, value, label, color }: any) {
  const colors: Record<string, string> = { 
    primary: "text-primary border-primary/20 bg-primary/10", 
    secondary: "text-secondary border-secondary/20 bg-secondary/10", 
    accent: "text-accent border-accent/20 bg-accent/10" 
  }
  
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ y: -5 }}>
      <Card className={`bg-slate-900/80 border ${colors[color].split(" ")[1]}`}>
        <CardContent className="flex items-center gap-4 p-6">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tighter">{value}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}