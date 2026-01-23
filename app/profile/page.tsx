"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Mail, 
  Calendar, 
  Trophy, 
  Star, 
  Target, 
  Award, 
  TrendingUp, 
  Shield, 
  Edit, 
  Clock, 
  Globe,
  Loader2,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthGuard from "@/components/auth-guard"
import { auth, db } from "@/lib/firebase"
import { 
  doc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore"
import { onAuthStateChanged, deleteUser, signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { getLevelThreshold } from "@/lib/activity"
import { CyberWrapper } from "@/components/cyber-wrapper"

// --- TYPES ---
type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

type Activity = {
  description: string
  timestamp: any 
  type: string
}

const achievementsList: Achievement[] = [
  { id: "a1", title: "First Steps", description: "Complete your first challenge", icon: "🎯", unlocked: true },
  { id: "a2", title: "Scanner Novice", description: "Perform 10 scans", icon: "🔍", unlocked: true, progress: 23, maxProgress: 10 },
  { id: "a3", title: "Knowledge Seeker", description: "Complete 5 quizzes", icon: "📚", unlocked: true, progress: 5, maxProgress: 5 },
  { id: "a4", title: "Challenge Master", description: "Complete 10 challenges", icon: "🏆", unlocked: false, progress: 2, maxProgress: 10 },
  { id: "a5", title: "Perfect Score", description: "Get 100% on a quiz", icon: "⭐", unlocked: false },
  { id: "a6", title: "Top 100", description: "Reach top 100 on the leaderboard", icon: "👑", unlocked: false, progress: 142, maxProgress: 100 },
]

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "Other",
]

function formatDate(dateInput: any) {
  if (!dateInput) return "N/A"
  try {
    if (typeof dateInput.toDate === 'function') {
      return dateInput.toDate().toLocaleDateString()
    }
    return new Date(dateInput).toLocaleDateString()
  } catch (e) {
    return "Invalid Date"
  }
}

function ProfileContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [editing, setEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")
  const [rank, setRank] = useState<number | string>("-")
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setLoading(false)
        return
      }

      const userRef = doc(db, "users", currentUser.uid)
      const unsubUser = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          const currentStats = data.stats || { points: 0, level: 1 }

          // 🛠️ AUTO-FIX LEVEL
          let calcLevel = currentStats.level
          let threshold = getLevelThreshold(calcLevel)
          
          while (currentStats.points >= threshold) {
            calcLevel++
            threshold = getLevelThreshold(calcLevel)
          }

          if (calcLevel !== currentStats.level) {
             updateDoc(userRef, { "stats.level": calcLevel })
             currentStats.level = calcLevel
          }

          setUser({ ...data, stats: currentStats })
          setName(data.name || "")
          setCountry(data.country || "") 
        }
        setLoading(false)
      })

      const activityRef = collection(db, "users", currentUser.uid, "activity")
      const q = query(activityRef, orderBy("timestamp", "desc"), limit(10))
      
      const unsubActivity = onSnapshot(q, (snap) => {
        const activityList = snap.docs.map(doc => doc.data() as Activity)
        setActivities(activityList)
      })
      
      const rankQuery = query(collection(db, "users"), orderBy("stats.points", "desc"))
const unsubRank = onSnapshot(rankQuery, (snapshot) => {
  const allUsers = snapshot.docs.map(d => d.id)
  const myIndex = allUsers.indexOf(currentUser.uid)
  // If found, rank is index + 1. Otherwise "-"
  setRank(myIndex !== -1 ? myIndex + 1 : "-")
})

      return () => {
        unsubUser()
        unsubActivity()
        unsubRank()
      }
    })

    return () => unsubAuth()
  }, [])

  const saveProfile = async () => {
    if (!auth.currentUser) return
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: name,
        country: country 
      })
      setEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action is permanent and cannot be undone."
    )
    if (!confirmed) return

    setIsDeleting(true)
    const currentUser = auth.currentUser

    if (currentUser) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid))
        await deleteUser(currentUser)
        router.push("/")
      } catch (error: any) {
        console.error("Error deleting account:", error)
        setIsDeleting(false)
        if (error.code === 'auth/requires-recent-login') {
          alert("For security, please log out and log in again before deleting your account.")
        } else {
          alert("Failed to delete account. Please try again.")
        }
      }
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/auth")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120]">
        <Loader2 className="h-10 w-10 animate-spin text-lime-400" />
      </div>
    )
  }

  if (!user) return null

  // ⚡ UPDATED LEVEL LOGIC
  const currentLevel = user.stats?.level || 1
  const currentPoints = user.stats?.points || 0
  
  const nextThreshold = getLevelThreshold(currentLevel)
  const prevThreshold = currentLevel === 1 ? 0 : getLevelThreshold(currentLevel - 1)
  
  const levelProgress = ((currentPoints - prevThreshold) / (nextThreshold - prevThreshold)) * 100
  const safeProgress = Math.min(100, Math.max(0, levelProgress))

  return (
    <CyberWrapper>
      <div className="container mx-auto px-4 py-8">
        
        {/* --- BACK BUTTON --- */}
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-lime-400 text-slate-400">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>

        {/* PROFILE HEADER CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-8 border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-500 to-transparent opacity-50" />
            
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-8 md:flex-row">
                
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-lime-500 to-cyan-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000"></div>
                  <Avatar className="h-32 w-32 relative border-4 border-[#0f172a]">
                    <AvatarFallback className="text-4xl bg-slate-800 text-lime-400 font-bold">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 text-center md:text-left w-full">
                  <div className="mb-2 flex flex-col items-center gap-4 md:flex-row">
                    {editing ? (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-slate-600 rounded px-3 py-1 bg-slate-800 text-white w-full md:w-auto focus:ring-2 focus:ring-lime-500 outline-none"
                        placeholder="Display Name"
                      />
                    ) : (
                      <h1 className="text-4xl font-extrabold text-white tracking-tight">{user.name}</h1>
                    )}

                    <Badge variant="outline" className="border-lime-500/50 text-lime-400 bg-lime-500/10 px-3 py-1">
                      Level {currentLevel} Operator
                    </Badge>
                  </div>

                  <div className="mb-6 flex flex-col gap-3 text-sm text-slate-400 md:flex-row md:gap-6">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Mail className="h-4 w-4 text-cyan-400" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      Joined {formatDate(user.createdAt)}
                    </div>
                    
                    {!editing && user.country && (
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Globe className="h-4 w-4 text-orange-400" />
                        {user.country}
                      </div>
                    )}
                  </div>

                  {editing && (
                    <div className="mb-4">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="border border-slate-600 rounded px-3 py-2 bg-slate-800 text-white w-full md:w-64 focus:ring-2 focus:ring-lime-500 outline-none"
                      >
                        <option value="">Select Country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-lime-400">XP</span>
                    <Progress value={safeProgress} className="h-2 flex-1 bg-slate-800" />
                    <span className="text-xs font-mono text-slate-400">
                      {currentPoints}/{nextThreshold}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setEditing(!editing)}
                    className="border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {editing && (
                    <Button onClick={saveProfile} className="bg-lime-500 text-black hover:bg-lime-400 font-bold">
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* STATS GRID */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <StatBox icon={Star} value={user.stats?.points || 0} label="Total Points" color="lime" />
          <StatBox icon={Trophy} value={`#${rank}`} label="Global Rank" color="purple" />
          <StatBox icon={Target} value={user.stats?.challengesCompleted || 0} label="Challenges" color="cyan" />
          <StatBox icon={Shield} value={user.stats?.scansCompleted || 0} label="Scans Performed" color="orange" />
        </div>

        {/* TABS SECTION */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:mx-auto lg:max-w-md bg-slate-900 border border-slate-800">
            <TabsTrigger value="achievements" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black">
              <Award className="h-4 w-4 mr-2" /> Achievements
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <TrendingUp className="h-4 w-4 mr-2" /> Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Badges & Achievements</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAllAchievements(!showAllAchievements)} className="text-slate-400 hover:text-white">
                    {showAllAchievements ? "Show Less" : "View All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(showAllAchievements ? achievementsList : achievementsList.slice(0, 6)).map((ach) => (
                    <motion.div
                      key={ach.id}
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-xl border p-4 text-center transition-all ${
                        ach.unlocked 
                          ? "border-lime-500/30 bg-lime-500/5 shadow-[0_0_15px_-5px_rgba(132,204,22,0.2)]" 
                          : "border-slate-800 bg-slate-900/50 opacity-50 grayscale"
                      }`}
                    >
                      <div className="text-4xl mb-3">{ach.icon}</div>
                      <h4 className={`font-bold text-sm mb-1 ${ach.unlocked ? "text-white" : "text-slate-500"}`}>
                        {ach.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{ach.description}</p>
                      {ach.progress !== undefined && (
                        <div className="mt-3">
                          <Progress value={(ach.progress / ach.maxProgress!) * 100} className="h-1.5 bg-slate-800" />
                          <p className="text-[10px] text-slate-500 mt-1 text-right">
                            {ach.progress}/{ach.maxProgress}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">Your latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((act, index) => (
                      <div key={index} className="flex items-center gap-4 rounded-lg border border-slate-800 p-4 hover:bg-slate-800/50 transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                           <Shield className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-200">{act.description}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(act.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No recent activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ⚠️ DANGER ZONE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="mt-12 border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-white font-semibold">Delete Account</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Permanently remove your personal data, progress, and badges. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount} 
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
                >
                  {isDeleting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 className="mr-2 h-4 w-4" /> Delete Account</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </CyberWrapper>
  )
}

function StatBox({ icon: Icon, value, label, color }: any) {
  const colors: Record<string, string> = { 
    lime: "text-lime-400 bg-lime-400/10 border-lime-500/20", 
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-500/20", 
    purple: "text-purple-400 bg-purple-400/10 border-purple-500/20",
    orange: "text-orange-400 bg-orange-400/10 border-orange-500/20" 
  }

  return (
    <motion.div whileHover={{ y: -5 }}>
      <div className={`rounded-xl border bg-slate-900/50 p-6 flex items-center gap-4 ${colors[color].split(" ")[2]}`}>
        <div className={`p-3 rounded-lg ${colors[color].split(" ")[1]} ${colors[color].split(" ")[0]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white font-mono">{value}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}