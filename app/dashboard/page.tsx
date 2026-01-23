"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Scan,
  BookOpen,
  Gamepad2,
  TrendingUp,
  Award,
  Clock,
  Shield,
  ArrowRight,
  Globe,
  Zap,
  Activity,
  Map, // ⚡ Added Map Icon
  Flag // ⚡ Added Flag Icon
} from "lucide-react"

import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

import { auth, db } from "@/lib/firebase"
import AuthGuard from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getLevelThreshold } from "@/lib/activity"
// --- TYPES ---
interface UserStats {
  scansCompleted: number
  quizzesCompleted: number
  challengesCompleted: number
  points: number
  level: number
}

interface ActivityItem {
  type: "scan" | "quiz" | "challenge" | "achievement"
  description: string
  timestamp: any
}

function DashboardContent() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [name, setName] = useState("")
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubUser: (() => void) | undefined
    let unsubActivity: (() => void) | undefined

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Cleanup old listeners immediately
      if (unsubUser) unsubUser()
      if (unsubActivity) unsubActivity()

      if (!user) {
        setLoading(false)
        // We rely on AuthGuard or the Router to handle the redirect, 
        // so we don't need to force it here, preventing race conditions.
        return
      }

      // 1. Setup User Listener WITH ERROR HANDLING
      const userRef = doc(db, "users", user.uid)
      unsubUser = onSnapshot(
        userRef,
        (snap) => {
          if (!snap.exists()) return
          const data = snap.data()
          // ... (Keep your existing Level Up logic here) ...
          
          setName(data.name || "Operative")
          setStats(data.stats || { points: 0, level: 1 })
          setLoading(false)
        },
        // ⚡ ERROR HANDLER: Silences the logout error
        (error) => {
          if (error.code === "permission-denied") {
            console.log("Logout cleanup: Listener detached.")
            return
          }
          console.error("Firestore Error:", error)
        }
      )

      // 2. Setup Activity Listener WITH ERROR HANDLING
      const activityRef = collection(db, "users", user.uid, "activity")
      const q = query(activityRef, orderBy("timestamp", "desc"), limit(5))
      unsubActivity = onSnapshot(
        q, 
        (snap) => {
          setActivity(snap.docs.map((d) => d.data() as ActivityItem))
        },
        // ⚡ ERROR HANDLER
        (error) => {
          if (error.code === "permission-denied") return
          console.error("Activity Error:", error)
        }
      )
    })

    return () => {
      unsubAuth()
      if (unsubUser) unsubUser()
      if (unsubActivity) unsubActivity()
    }
  }, [router])

  if (loading || !stats) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-blue-500">
      <Activity className="animate-spin h-8 w-8" />
    </div>
  )

  // ⚡ LEVEL CALCULATIONS
  const currentLevel = stats.level || 1
  const currentPoints = stats.points || 0
  const nextThreshold = getLevelThreshold(currentLevel)
  const prevThreshold = currentLevel === 1 ? 0 : getLevelThreshold(currentLevel - 1)
  const levelProgress = ((currentPoints - prevThreshold) / (nextThreshold - prevThreshold)) * 100
  const safeProgress = Math.min(100, Math.max(0, levelProgress))

  return (
    <div className="min-h-screen bg-black text-slate-200 relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">

        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div>
            <h1 className="text-5xl font-black mb-2 text-white tracking-tighter">
              WELCOME, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{name.toUpperCase()}</span>
            </h1>
            <p className="text-lg text-slate-400">Command Center Online. Systems Nominal.</p>
          </div>
          
          {/* LEVEL BADGE */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl min-w-[200px] backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400 font-mono">LEVEL {currentLevel}</span>
              <Award className="h-5 w-5 text-yellow-500" />
            </div>
            <Progress value={safeProgress} className="h-2 bg-slate-800 mb-2" />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>{currentPoints} XP</span>
              <span>{nextThreshold} XP</span>
            </div>
          </div>
        </motion.div>

        {/* STATS GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <StatCard title="Total Points" value={stats.points} icon={Zap} color="text-yellow-400" delay={0.1} />
          <StatCard title="Scans Run" value={stats.scansCompleted} icon={Scan} color="text-blue-400" delay={0.2} />
          <StatCard title="Quizzes Solved" value={stats.quizzesCompleted} icon={BookOpen} color="text-emerald-400" delay={0.3} />
          <StatCard title="CTF Captures" value={stats.challengesCompleted} icon={Gamepad2} color="text-purple-400" delay={0.4} />
        </div>

        {/* OPERATIONAL MODULES */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500"/> Operational Modules
        </h2>
        
        {/* 🚀 NEW ROADMAP BANNER (FULL WIDTH) */}
        <div className="mb-6">
          <RoadmapBanner delay={0.1} />
        </div>

        {/* HUBS GRID (SINGLE LINE) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <QuickCard 
            icon={Scan} 
            title="Scanning Hub" 
            desc="Analyze URLs, IPs & Files."
            href="/scan" 
            color="bg-blue-500/10 text-blue-400 border-blue-500/20"
            hoverColor="group-hover:text-blue-400"
            delay={0.2}
          />
          <QuickCard 
            icon={BookOpen} 
            title="Education Hub" 
            desc="Labs, News & Tutorials."
            href="/learn" 
            color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            hoverColor="group-hover:text-emerald-400"
            delay={0.3}
          />
          <QuickCard 
            icon={Gamepad2} 
            title="GameZone" 
            desc="CTF Challenges & Rank."
            href="/gamezone" 
            color="bg-purple-500/10 text-purple-400 border-purple-500/20"
            hoverColor="group-hover:text-purple-400"
            delay={0.4}
          />
          <QuickCard 
            icon={Globe} 
            title="OSINT Hub" 
            desc="Open Source Intel Tools."
            href="/osint" 
            color="bg-orange-500/10 text-orange-400 border-orange-500/20"
            hoverColor="group-hover:text-orange-400"
            delay={0.5}
          />
        </div>

       

        {/* RECENT ACTIVITY LOG */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-[#0b0f17] border-slate-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Live Activity Feed</CardTitle>
                  <CardDescription className="text-slate-400">Real-time system interactions.</CardDescription>
                </div>
                <Activity className="text-slate-500 h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {activity.length ? (
                <div className="space-y-4">
                  {activity.map((a, i) => (
                    <div key={i} className="flex gap-4 items-center border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700">
                        {a.type === 'scan' && <Scan className="h-4 w-4 text-blue-400" />}
                        {a.type === 'quiz' && <BookOpen className="h-4 w-4 text-emerald-400" />}
                        {a.type === 'challenge' && <Gamepad2 className="h-4 w-4 text-purple-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{a.description}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="h-3 w-3" />
                          {a.timestamp?.toDate?.().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-600">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No system activity detected yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}

/* --- SUB COMPONENTS --- */

function StatCard({ title, value, icon: Icon, color, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }}>
      <Card className="bg-[#0b0f17] border-slate-800 hover:border-slate-700 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ⚡ NEW: FULL WIDTH ROADMAP BANNER
function RoadmapBanner({ delay }: { delay: number }) {
  const router = useRouter()
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }}
    >
      <Card 
        className="bg-[#0b0f17] border-slate-800 hover:border-lime-500/50 cursor-pointer group transition-all duration-300 relative overflow-hidden"
        onClick={() => router.push("/roadmap")}
      >
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-lime-500/10 transition-all" />
        
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
               <Flag className="h-8 w-8 text-lime-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                Career Roadmap 
                <span className="text-xs bg-lime-500/20 text-lime-400 px-2 py-0.5 rounded-full border border-lime-500/30 font-mono">
                  NEW MISSION
                </span>
              </h3>
              <p className="text-slate-400 max-w-xl">
                Don't learn aimlessly. Follow the structured path from Novice to Pro, track your progress, and access verified free resources.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800 group-hover:border-lime-500/30 transition-colors">
            <span className="text-lime-400 font-bold text-sm">Open Map</span>
            <ArrowRight className="h-4 w-4 text-lime-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickCard({ icon: Icon, title, desc, href, color, hoverColor, delay }: any) {
  const router = useRouter()
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card 
        className="h-full bg-[#0b0f17] border-slate-800 hover:border-slate-600 cursor-pointer group transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10" 
        onClick={() => router.push(href)}
      >
        <CardHeader>
          <div className={`h-12 w-12 rounded-lg border flex items-center justify-center mb-4 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className={`text-white ${hoverColor} transition-colors flex items-center gap-2`}>
            {title} <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </CardTitle>
          <CardDescription className="text-slate-400">{desc}</CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}