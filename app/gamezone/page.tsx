"use client"

import {
  Gamepad2,
  Trophy,
  CheckCircle,
  ArrowRight,
  Target,
  Shield,
  Code,
  Network,
  Terminal,
  Loader2,
  Zap,
  RotateCcw,
  Globe,
  Cpu,
  Brain,
  Star,
  ShieldCheck, // For Medium
  ShieldAlert, // For Hard
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot, collection, query, orderBy, limit, updateDoc, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { motion, AnimatePresence } from "framer-motion"
import { getLevelThreshold } from "@/lib/activity"
import { CyberWrapper } from "@/components/cyber-wrapper"

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

// 🖼️ QUIZ DATA
const quizzes = [
  { 
    id: "q1", 
    title: "Cybersecurity Fundamentals", 
    questions: 20, 
    difficulty: "Beginner",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800",
  },
  { 
    id: "q2", 
    title: "Network Security Protocols", 
    questions: 25, 
    difficulty: "Intermediate",
    image: "https://onlinedegrees.sandiego.edu/wp-content/uploads/2016/09/cyber-security-threats.jpeg",
  },
  { 
    id: "q3", 
    title: "Advanced Threat Detection", 
    questions: 30, 
    difficulty: "Advanced",
    image: "https://www.cloudavize.com/wp-content/uploads/2025/01/Cyber-Threats.webp",
  },
]

// ⚡ OPTIMIZED COUNT UP
function CountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (value <= 20) {
      setCount(value)
      return
    }

    let start = 0
    const end = value
    if (start === end) return
    
    const duration = 800 
    const incrementTime = (duration / end) * 10
    
    const timer = setInterval(() => {
      start += Math.max(1, Math.ceil(end / 20))
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
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"quiz" | "challenges" | "rank">("quiz")
  
  // Leaderboard Data
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const userRankIndex = leaderboard.findIndex(u => u.id === currentUserId);
  const realRank = userRankIndex !== -1 ? userRankIndex + 1 : "-";

  // Level Calc
  const nextLevelPoints = getLevelThreshold(stats.level)
  const previousLevelPoints = stats.level === 1 ? 0 : getLevelThreshold(stats.level - 1)
  const currentLevelProgress = Math.max(0, stats.points - previousLevelPoints)
  const levelRange = nextLevelPoints - previousLevelPoints
  const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / levelRange) * 100))

  useEffect(() => {
    // Restore Tab
    const savedTab = localStorage.getItem("gamezone_tab") as "quiz" | "challenges" | "rank"
    if (savedTab) setActiveTab(savedTab)

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return setLoading(false)
      
      setCurrentUserId(user.uid)

      // User Listener
      const unsubDoc = onSnapshot(doc(db, "users", user.uid), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const currentStats = data.stats || { points: 0, challengesCompleted: 0, level: 1 }
          
          // Self-Healing
          let calcLevel = currentStats.level
          let threshold = getLevelThreshold(calcLevel)
          while (currentStats.points >= threshold) {
            calcLevel++
            threshold = getLevelThreshold(calcLevel)
          }
          if (calcLevel !== currentStats.level) {
             updateDoc(doc(db, "users", user.uid), { "stats.level": calcLevel })
             currentStats.level = calcLevel
          }

          setStats(currentStats)
          setCompletedIds(data.completedChallenges || [])
        }
        setLoading(false)
      })

      // Fetch Leaderboard (Top 50)
      const fetchLeaderboard = async () => {
        const q = query(collection(db, "users"), orderBy("stats.points", "desc"), limit(50))
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setLeaderboard(data)
      }
      fetchLeaderboard()

      return () => unsubDoc()
    })
    return () => unsubAuth()
  }, [])

  const handleTabChange = (tab: "quiz" | "challenges" | "rank") => {
    setActiveTab(tab)
    localStorage.setItem("gamezone_tab", tab)
  }

  // 🟢 ICON HELPER
  const getCategoryIcon = (cat: string) => {
    if (cat.includes("Linux")) return <Terminal className="h-6 w-6 text-lime-400" />
    if (cat.includes("Web")) return <Globe className="h-6 w-6 text-lime-400" />
    if (cat.includes("Network")) return <Network className="h-6 w-6 text-lime-400" />
    if (cat.includes("Cloud")) return <Cpu className="h-6 w-6 text-lime-400" />
    return <Shield className="h-6 w-6 text-lime-400" />
  }

  // 🟢 GROUP CHALLENGES BY DIFFICULTY
  const easyChallenges = challengesList.filter(c => c.difficulty === "Easy")
  const mediumChallenges = challengesList.filter(c => c.difficulty === "Medium")
  const hardChallenges = challengesList.filter(c => c.difficulty === "Hard")

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--background)]">
      <Loader2 className="h-10 w-10 animate-spin text-lime-400" />
    </div>
  )

  return (
    <AuthGuard>
      <CyberWrapper>
        <div className="container mx-auto px-4 py-12">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              Game<span className="text-lime-400">Zone</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Engage in high-stakes cyber simulations. Hack, defend, and climb the leaderboard.
            </p>
          </motion.div>

          {/* STATS */}
          <div className="mb-12 grid gap-6 md:grid-cols-4">
             <StatCard icon={Zap} value={<CountUp value={stats.points} />} label="Total Points" color="lime" />
             <StatCard icon={CheckCircle} value={<CountUp value={stats.challengesCompleted} />} label="Completed" color="cyan" />
             <StatCard icon={Trophy} value={`#${realRank}`} label="Global Rank" color="purple" />
             
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="rounded-xl border border-slate-800 bg-[#0f141f] p-6"
             >
               <div className="mb-2 flex justify-between text-sm font-bold">
                 <span className="text-lime-400">Level {stats.level}</span>
                 <span className="text-slate-400">{stats.points} / {nextLevelPoints} XP</span>
               </div>
               <Progress value={progressPercent} className="h-2 bg-slate-800" />
             </motion.div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex justify-center mb-10">
            <div className="bg-slate-900 p-1 rounded-full border border-slate-800 flex gap-2">
              <TabButton active={activeTab === "quiz"} onClick={() => handleTabChange("quiz")} icon={Brain} label="Daily Quiz" />
              <TabButton active={activeTab === "challenges"} onClick={() => handleTabChange("challenges")} icon={Target} label="CTF Challenges" />
              <TabButton active={activeTab === "rank"} onClick={() => handleTabChange("rank")} icon={Trophy} label="My Rank" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* 1. QUIZ TAB */}
            {activeTab === "quiz" && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Daily Knowledge Check</h2>
                  <p className="text-slate-400">Test your theory skills before hitting the labs.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {quizzes.map((q, i) => (
                    <motion.div key={q.id} whileHover={{ y: -5 }}>
                      <Link href={`/gamezone/quiz/${q.id}`}>
                        <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#0f141f] hover:border-purple-500/50 transition-all">
                          <div className="relative h-48 w-full overflow-hidden">
                             <img src={q.image} alt={q.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                             <div className="absolute inset-0 bg-gradient-to-t from-[#0f141f] via-transparent to-transparent" />
                             <div className="absolute top-4 left-4">
                                <Badge className="bg-purple-500/90 text-white border-none">{q.questions} Questions</Badge>
                             </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 mb-2">{q.title}</h3>
                            <p className="text-slate-400 text-sm mb-4">Test your knowledge in {q.difficulty} concepts.</p>
                            <div className="flex items-center text-purple-400 font-semibold text-sm group-hover:gap-2 transition-all">
                              Take Quiz <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 2. CHALLENGES TAB (GROUPED BY DIFFICULTY) */}
            {activeTab === "challenges" && (
              <motion.div 
                key="challenges"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-12" // Spacing between sections
              >
                
                {/* 🟢 EASY CHALLENGES */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="h-6 w-6 text-green-400" />
                    <h2 className="text-2xl font-bold text-green-400">Easy Challenges</h2>
                  </div>
                  <ChallengeGrid challenges={easyChallenges} completedIds={completedIds} color="green" />
                </div>

                {/* 🟡 MEDIUM CHALLENGES */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="h-6 w-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-yellow-400">Medium Challenges</h2>
                  </div>
                  <ChallengeGrid challenges={mediumChallenges} completedIds={completedIds} color="yellow" />
                </div>

                {/* 🔴 HARD CHALLENGES */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <ShieldAlert className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-red-500">Hard Challenges</h2>
                  </div>
                  <ChallengeGrid challenges={hardChallenges} completedIds={completedIds} color="red" />
                </div>

              </motion.div>
            )}

            {/* 3. LEADERBOARD */}
            {activeTab === "rank" && (
              <motion.div 
                key="rank"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="border-slate-800 bg-[#0f141f]">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                      <Trophy className="text-yellow-500" /> Global Leaderboard
                    </CardTitle>
                    <CardDescription>Top agents in the network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard.map((user: any, index: number) => {
                        const isMe = user.id === currentUserId 
                        
                        return (
                          <div key={user.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            isMe 
                              ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_-5px_rgba(37,99,235,0.5)] scale-[1.02]" 
                              : "bg-slate-900/50 border-slate-800"
                          }`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? "bg-yellow-500 text-black" : 
                                index === 1 ? "bg-slate-400 text-black" :
                                index === 2 ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-400"
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className={`font-bold ${isMe ? "text-blue-400" : "text-white"}`}>
                                  {user.name || "Anonymous"} {isMe && "(You)"}
                                </div>
                                <div className="text-xs text-slate-500">Level {user.stats?.level || 1}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className={`w-4 h-4 ${isMe ? "text-blue-400" : "text-lime-400"}`} />
                              <span className={`font-mono font-bold ${isMe ? "text-blue-400" : "text-lime-400"}`}>
                                {user.stats?.points || 0}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </CyberWrapper>
    </AuthGuard>
  )
}

// 🟢 HELPER COMPONENT TO RENDER CHALLENGE GRIDS
function ChallengeGrid({ challenges, completedIds, color }: any) {
  const getCategoryIcon = (cat: string) => {
    if (cat.includes("Linux")) return <Terminal className={`h-6 w-6 text-${color}-400`} />
    if (cat.includes("Web")) return <Globe className={`h-6 w-6 text-${color}-400`} />
    if (cat.includes("Network")) return <Network className={`h-6 w-6 text-${color}-400`} />
    return <Shield className={`h-6 w-6 text-${color}-400`} />
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {challenges.map((c: any) => {
        const isCompleted = completedIds.includes(c.id)
        return (
          <Link key={c.id} href={`/gamezone/challenge/${c.id}`} className="block h-full">
            <div className={`group relative h-full flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 ${
              isCompleted 
                ? "border-green-500/30 bg-[#0B1520] hover:border-green-400/50" 
                : `border-slate-800 bg-[#0f141f] hover:border-${color}-500/50 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]`
            }`}>
              <div>
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border ${
                  isCompleted 
                    ? "border-green-500/30 bg-green-500/10" 
                    : `border-slate-700 bg-slate-800/50 group-hover:border-${color}-500/50 group-hover:text-${color}-400`
                }`}>
                  {getCategoryIcon(c.category)}
                </div>
                <h3 className={`mb-2 text-xl font-bold ${
                  isCompleted ? "text-green-400" : `text-${color}-400 group-hover:text-${color}-300`
                }`}>
                  {c.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{c.description}</p>
                <div className="flex gap-2 mb-6">
                   <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">{c.difficulty}</Badge>
                   <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">{c.points} XP</Badge>
                </div>
              </div>
              <div className={`mt-auto flex items-center justify-end gap-2 font-semibold transition-all ${
                 isCompleted ? "text-green-500" : `text-${color}-400 group-hover:gap-3 group-hover:text-${color}-300`
              }`}>
                {isCompleted ? <><RotateCcw className="h-4 w-4" /> Replay</> : <><ArrowRight className="h-4 w-4" /> Start</>}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function StatCard({ icon: Icon, value, label, color }: any) {
  const colors: Record<string, string> = { 
    lime: "text-lime-400 bg-lime-400/10", 
    cyan: "text-cyan-400 bg-cyan-400/10", 
    purple: "text-purple-400 bg-purple-400/10" 
  }
  
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ y: -5 }}>
      <div className="rounded-xl border border-slate-800 bg-[#0f141f] p-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-3xl font-bold font-mono tracking-tighter text-white">{value}</div>
          <div className="text-xs uppercase tracking-widest text-slate-500">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}