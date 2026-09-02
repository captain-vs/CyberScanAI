"use client"

import { useState, useEffect, useRef } from "react"
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
  LogOut,
  Github,
  Twitter,
  Linkedin,
  Briefcase,
  Code,
  Terminal,
  Cpu,
  Share2,
  Check,
  ShieldCheck,
  Flame,
  UserPlus,
  Users,
  Lock,
  Unlock,
  MessageSquare,
  Send,
  X,
  Upload,
  Plus,
  Link as LinkIcon,
  UserCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  onSnapshot,
  getDocs,
  where,
  addDoc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore"
import { onAuthStateChanged, deleteUser, signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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

type OperatorUser = {
  uid: string
  name: string
  email: string
  level: number
  profileVisibility: "public" | "private"
  avatarUrl?: string
  specialization?: string
  bio?: string
  country?: string
  experienceLevel?: string
  github?: string
  twitter?: string
  linkedin?: string
  customLinks?: CustomLink[]
}

type ConnectionRequest = {
  id: string
  senderUid: string
  receiverUid: string
  status: "pending" | "accepted" | "rejected"
}

type Message = {
  id: string
  senderUid: string
  receiverUid: string
  text: string
  timestamp: any
  read?: boolean
}

type CustomLink = {
  label: string
  url: string
}

const achievementsList: Achievement[] = [
  { id: "a1", title: "First Steps", description: "Complete your first challenge", icon: "🎯", unlocked: true },
  { id: "a2", title: "Scanner Novice", description: "Perform 10 scans", icon: "🔍", unlocked: true, progress: 10, maxProgress: 10 },
  { id: "a3", title: "Knowledge Seeker", description: "Complete 5 quizzes", icon: "📚", unlocked: true, progress: 5, maxProgress: 5 },
  { id: "a4", title: "Challenge Master", description: "Complete 10 challenges", icon: "🏆", unlocked: false, progress: 4, maxProgress: 10 },
  { id: "a5", title: "Perfect Score", description: "Get 100% on a quiz", icon: "⭐", unlocked: false },
  { id: "a6", title: "Elite Hacker", description: "Reach Level 10 Operator status", icon: "👑", unlocked: false, progress: 3, maxProgress: 10 },
]

const COUNTRIES = [
  "Argentina", "Australia", "Brazil", "Canada", "China", "France", 
  "Germany", "India", "Indonesia", "Italy", "Japan", "Mexico", 
  "Netherlands", "New Zealand", "Nigeria", "Philippines", "Singapore", 
  "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", 
  "United Kingdom", "United States", "Other"
]

const SPECIALIZATIONS = [
  "Web Security", "Network Defense", "OSINT", "Malware Analysis", "Cryptography", "Cloud Security", "General / Beginner"
]

const EXPERIENCE_LEVELS = [
  "Novice", "Beginner", "Intermediate", "Advanced", "Expert"
]

function formatDate(dateInput: any) {
  if (!dateInput) return "N/A"
  try {
    if (typeof dateInput.toDate === 'function') {
      return dateInput.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }
    return new Date(dateInput).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return "Invalid Date"
  }
}

function ProfileContent() {
  const [viewingOperator, setViewingOperator] = useState<OperatorUser | null>(null)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [editing, setEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [showExactCount, setShowExactCount] = useState(false)
  
  // Edit State
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")
  const [bio, setBio] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [github, setGithub] = useState("")
  const [twitter, setTwitter] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("public")
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([])
  const [newLinkLabel, setNewLinkLabel] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [imageError, setImageError] = useState("")

  const [rank, setRank] = useState<number | string>("-")

  // Connection & Chat State
  const [allOperators, setAllOperators] = useState<OperatorUser[]>([])
  const [connections, setConnections] = useState<string[]>([])
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([])
  const [allMessagesMap, setAllMessagesMap] = useState<Record<string, Message[]>>({})

  const markMessagesAsRead = async (partnerUid: string) => {
    if (!auth.currentUser) return
    const myUid = auth.currentUser.uid
    try {
      const q = query(
        collection(db, "messages"),
        where("senderUid", "==", partnerUid),
        where("receiverUid", "==", myUid),
        where("read", "==", false)
      )
      const snap = await getDocs(q)
      if (snap.empty) return

      const batch = writeBatch(db)
      snap.forEach(d => {
        batch.update(doc(db, "messages", d.id), { read: true })
      })
      await batch.commit()
    } catch (err) {
      console.warn("Mark read batch error:", err)
    }
  }
  
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
          setBio(data.bio || "")
          setSpecialization(data.specialization || "")
          setExperienceLevel(data.experienceLevel || "")
          setGithub(data.github || "")
          setTwitter(data.twitter || "")
          setLinkedin(data.linkedin || "")
          setBannerUrl(data.bannerUrl || "")
          setAvatarUrl(data.avatarUrl || "")
          setProfileVisibility(data.profileVisibility || "public")
          setConnections(data.connections || [])
          setCustomLinks(data.customLinks || [])
        }
        setLoading(false)
      })

      // Fetch Platform Operators List
      const unsubOperators = onSnapshot(collection(db, "users"), (snapshot) => {
        const ops: OperatorUser[] = []
        snapshot.forEach((d) => {
          if (d.id !== currentUser.uid) {
            const dData = d.data()
            ops.push({
              uid: d.id,
              name: dData.name || "Anonymous Operator",
              email: dData.email || "",
              level: dData.stats?.level || 1,
              profileVisibility: dData.profileVisibility || "public",
              avatarUrl: dData.avatarUrl || "",
              specialization: dData.specialization || "",
              bio: dData.bio || "",
              country: dData.country || "",
              experienceLevel: dData.experienceLevel || "",
              github: dData.github || "",
              twitter: dData.twitter || "",
              linkedin: dData.linkedin || "",
              customLinks: dData.customLinks || []
            })
          }
        })
        setAllOperators(ops)
      }, (error) => {
        if (auth.currentUser) console.warn("Operators listener warning:", error)
      })

      // Fetch Connection Requests
      let unsubIncoming = () => {}
      let unsubSent = () => {}
      try {
        const incQuery = query(collection(db, "connectionRequests"), where("receiverUid", "==", currentUser.uid))
        unsubIncoming = onSnapshot(incQuery, (snap) => {
          const reqs: ConnectionRequest[] = []
          snap.forEach(d => reqs.push({ id: d.id, ...d.data() } as ConnectionRequest))
          setIncomingRequests(reqs)
        }, (err) => { if (auth.currentUser) console.warn("Incoming reqs note:", err) })

        const sentQuery = query(collection(db, "connectionRequests"), where("senderUid", "==", currentUser.uid))
        unsubSent = onSnapshot(sentQuery, (snap) => {
          const reqs: ConnectionRequest[] = []
          snap.forEach(d => reqs.push({ id: d.id, ...d.data() } as ConnectionRequest))
          setSentRequests(reqs)
        }, (err) => { if (auth.currentUser) console.warn("Sent reqs note:", err) })
      } catch (err) {
        console.warn("Requests setup skipped")
      }

      // Fetch Messages for real-time chat map across all conversations
      let unsubMsgHub = () => {}
      try {
        const msgQuery = query(collection(db, "messages"))
        unsubMsgHub = onSnapshot(msgQuery, (snap) => {
          const map: Record<string, Message[]> = {}
          snap.forEach(d => {
            const m = { id: d.id, ...d.data() } as Message
            if (m.senderUid === currentUser.uid || m.receiverUid === currentUser.uid) {
              const partnerUid = m.senderUid === currentUser.uid ? m.receiverUid : m.senderUid
              if (!map[partnerUid]) map[partnerUid] = []
              map[partnerUid].push(m)
            }
          })
          Object.keys(map).forEach(partner => {
            map[partner].sort((a, b) => {
              const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0
              const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0
              return timeA - timeB
            })
          })
          setAllMessagesMap(map)
        }, (err) => { if (auth.currentUser) console.warn("Message hub note:", err) })
      } catch (err) {
        console.warn("Message hub setup skipped")
      }

      const activityRef = collection(db, "users", currentUser.uid, "activity")
      const q = query(activityRef, orderBy("timestamp", "desc"), limit(15))
      
      const unsubActivity = onSnapshot(q, (snap) => {
        const activityList = snap.docs.map(doc => doc.data() as Activity)
        setActivities(activityList)
      }, (error) => { if (auth.currentUser) console.warn("Activity note:", error) })
      
      const rankQuery = query(collection(db, "users"), orderBy("stats.points", "desc"))
      const unsubRank = onSnapshot(rankQuery, (snapshot) => {
        const allUsers = snapshot.docs.map(d => d.id)
        const myIndex = allUsers.indexOf(currentUser.uid)
        setRank(myIndex !== -1 ? myIndex + 1 : "-")
      }, (error) => { if (auth.currentUser) console.warn("Rank note:", error) })

      return () => {
        unsubUser()
        unsubOperators()
        unsubIncoming()
        unsubSent()
        unsubMsgHub()
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
        name,
        country,
        bio,
        specialization,
        experienceLevel,
        github,
        twitter,
        linkedin,
        bannerUrl,
        avatarUrl,
        profileVisibility,
        customLinks
      })
      setEditing(false)
      setImageError("")
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError("")
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        const MAX_WIDTH = type === 'avatar' ? 250 : 1000
        const MAX_HEIGHT = type === 'avatar' ? 250 : 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
        
        if (compressedBase64.length > 900000) {
          setImageError("Image file is too large even after compression. Please use a smaller image or paste an image URL.")
          return
        }

        if (type === 'avatar') {
          setAvatarUrl(compressedBase64)
        } else {
          setBannerUrl(compressedBase64)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleAddCustomLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return
    setCustomLinks([...customLinks, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }])
    setNewLinkLabel("")
    setNewLinkUrl("")
  }

  const handleRemoveCustomLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index))
  }

  const handleConnect = async (targetOp: OperatorUser) => {
    if (!auth.currentUser) return
    const myUid = auth.currentUser.uid

    if (targetOp.profileVisibility === "public") {
      const updatedMyConnections = [...connections, targetOp.uid]
      await updateDoc(doc(db, "users", myUid), { connections: updatedMyConnections })
      setConnections(updatedMyConnections)

      try {
        const targetRef = doc(db, "users", targetOp.uid)
        const targetSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", targetOp.uid)))
        if (!targetSnap.empty) {
          const targetData = targetSnap.docs[0].data()
          const targetConns = targetData.connections || []
          if (!targetConns.includes(myUid)) {
            await updateDoc(targetRef, { connections: [...targetConns, myUid] })
          }
        }
      } catch (err) {
        console.warn("Mutual sync note:", err)
      }
    } else {
      try {
        await addDoc(collection(db, "connectionRequests"), {
          senderUid: myUid,
          receiverUid: targetOp.uid,
          status: "pending",
          timestamp: serverTimestamp()
        })
      } catch (err) {
        console.warn("Request send note:", err)
      }
    }
  }

  const handleAcceptRequest = async (req: ConnectionRequest) => {
    if (!auth.currentUser) return
    const myUid = auth.currentUser.uid

    try {
      await updateDoc(doc(db, "connectionRequests", req.id), { status: "accepted" })
      const newConns = [...connections, req.senderUid]
      await updateDoc(doc(db, "users", myUid), { connections: newConns })
      setConnections(newConns)

      const senderRef = doc(db, "users", req.senderUid)
      const senderDocSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", req.senderUid)))
      if (!senderDocSnap.empty) {
        const senderData = senderDocSnap.docs[0].data()
        const senderConns = senderData.connections || []
        if (!senderConns.includes(myUid)) {
          await updateDoc(senderRef, { connections: [...senderConns, myUid] })
        }
      }
    } catch (err) {
      console.error("Accept error:", err)
    }
  }

  const handleShareProfile = () => {
    const profileUrl = window.location.href
    navigator.clipboard.writeText(profileUrl)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2500)
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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-lime-400" />
      </div>
    )
  }

  if (!user) return null

  const currentLevel = user.stats?.level || 1
  const currentPoints = user.stats?.points || 0
  
  const nextThreshold = getLevelThreshold(currentLevel)
  const prevThreshold = currentLevel === 1 ? 0 : getLevelThreshold(currentLevel - 1)
  
  const levelProgress = ((currentPoints - prevThreshold) / (nextThreshold - prevThreshold)) * 100
  const safeProgress = Math.min(100, Math.max(0, levelProgress))
  const unlockedCount = achievementsList.filter(a => a.unlocked).length

  const connCount = connections.length
  let connDisplay = `${connCount} connections`
  if (connCount > 5 && connCount < 30) {
    connDisplay = "20+ connections"
  } else if (connCount >= 30 && connCount < 50) {
    connDisplay = "30+ connections"
  } else if (connCount >= 50 && connCount < 100) {
    connDisplay = "50+ connections"
  } else if (connCount >= 100) {
    connDisplay = "100+ connections"
  }

  const connectedOperators = allOperators.filter(op => connections.includes(op.uid))

  const unreadSendersCount = connectedOperators.filter(op => {
    const chatList = allMessagesMap[op.uid] || []
    return chatList.some(m => m.senderUid === op.uid && !m.read)
  }).length

  return (
    <CyberWrapper>
      <div className="w-full px-4 md:px-8 py-8 max-w-[1600px] mx-auto">
        
        {/* --- TOP NAVIGATION BAR --- */}
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-lime-400 text-slate-400 font-mono text-sm">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              cd ~/dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleShareProfile}
              className="border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono"
            >
              {copiedShare ? <Check className="h-3.5 w-3.5 mr-1.5 text-lime-400" /> : <Share2 className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />}
              {copiedShare ? "Link Copied!" : "Share Profile"}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs font-mono">
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Logout
            </Button>
          </div>
        </div>

        {/* --- PROFILE BANNER & CARD --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-8 border-slate-800 bg-slate-900/80 backdrop-blur-md overflow-hidden relative shadow-2xl rounded-2xl">
            
            <div className="relative h-48 md:h-64 w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex items-center justify-center">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Profile Banner" className="w-full h-full object-cover object-center max-h-64" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 opacity-90 flex items-center justify-center">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
                  <span className="text-slate-600 font-mono text-sm tracking-widest uppercase">SecurityX Banner Area</span>
                </div>
              )}
            </div>

            <CardContent className="px-6 md:px-10 pb-8 pt-0 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 mb-6 gap-4">
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-lime-500 to-cyan-500 rounded-2xl opacity-75 blur transition duration-500"></div>
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 relative rounded-2xl border-4 border-slate-900 bg-slate-950 shadow-2xl">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-4xl md:text-5xl bg-slate-900 text-lime-400 font-mono font-bold rounded-2xl">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "SX"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-2 right-2 bg-slate-900 border border-lime-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-lime-400 flex items-center gap-1 shadow-lg">
                    <ShieldCheck className="h-3 w-3 text-lime-400" /> Verified
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <Badge variant="outline" className={`font-mono text-xs px-3 py-1.5 ${profileVisibility === 'public' ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' : 'border-purple-500/40 text-purple-400 bg-purple-500/10'}`}>
                    {profileVisibility === 'public' ? <Unlock className="h-3 w-3 mr-1 inline" /> : <Lock className="h-3 w-3 mr-1 inline" />}
                    {profileVisibility.toUpperCase()} PROFILE
                  </Badge>

                  <Button 
                    variant="outline" 
                    onClick={() => setEditing(!editing)}
                    className="border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-white h-10 px-4 font-mono text-xs"
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" /> {editing ? "Cancel" : "Edit Profile"}
                  </Button>
                  {editing && (
                    <Button onClick={saveProfile} className="bg-lime-500 text-black hover:bg-lime-400 font-bold h-10 px-4 font-mono text-xs shadow-[0_0_15px_rgba(132,204,22,0.3)]">
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  {editing ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-950 text-white w-full md:w-80 focus:ring-2 focus:ring-lime-500 outline-none font-bold text-2xl font-mono"
                      placeholder="Operator Name"
                    />
                  ) : (
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-mono">{user.name || "SecurityX Operator"}</h1>
                  )}

                  <Badge variant="outline" className="border-lime-500/40 text-lime-400 bg-lime-500/10 px-3 py-1 font-mono text-xs w-fit">
                    <Terminal className="h-3 w-3 mr-1.5 inline" /> Level {currentLevel} Operator
                  </Badge>
                </div>

                {!editing && (
                  <>
                    {user.bio ? (
                      <p className="text-slate-300 text-sm max-w-2xl italic font-sans">{user.bio}</p>
                    ) : (
                      <p className="text-slate-500 text-xs italic">No bio configured yet.</p>
                    )}

                    <div className="pt-1">
                      <button 
                        onClick={() => setShowExactCount(!showExactCount)}
                        className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full w-fit transition"
                      >
                        <Users className="h-3.5 w-3.5" /> {connDisplay}
                      </button>
                      {showExactCount && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-mono text-slate-400 mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 w-fit">
                          Exact connected operators: <strong className="text-white">{connCount}</strong>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800"><Mail className="h-3.5 w-3.5 text-cyan-400" /> {user.email}</div>
                      <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800"><Calendar className="h-3.5 w-3.5 text-purple-400" /> Joined {formatDate(user.createdAt)}</div>
                      {user.country && <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800"><Globe className="h-3.5 w-3.5 text-orange-400" /> {user.country}</div>}
                      {user.specialization && <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800"><Code className="h-3.5 w-3.5 text-pink-400" /> {user.specialization}</div>}
                      {user.experienceLevel && <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800"><Briefcase className="h-3.5 w-3.5 text-lime-400" /> {user.experienceLevel}</div>}
                    </div>

                    {(user.github || user.twitter || user.linkedin || (user.customLinks && user.customLinks.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {user.github && (
                          <a href={`https://github.com/${user.github.replace('@', '').replace('https://github.com/', '')}`} target="_blank" rel="noopener noreferrer" className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-mono">
                            <Github className="h-3.5 w-3.5" /> github/{user.github.replace('@', '')}
                          </a>
                        )}
                        {user.twitter && (
                          <a href={`https://twitter.com/${user.twitter.replace('@', '').replace('https://twitter.com/', '')}`} target="_blank" rel="noopener noreferrer" className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-[#1DA1F2] transition-all flex items-center gap-2 text-xs font-mono">
                            <Twitter className="h-3.5 w-3.5" /> @{user.twitter.replace('@', '')}
                          </a>
                        )}
                        {user.linkedin && (
                          <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-[#0A66C2] transition-all flex items-center gap-2 text-xs font-mono">
                            <Linkedin className="h-3.5 w-3.5" /> LinkedIn Profile
                          </a>
                        )}
                        {user.customLinks && user.customLinks.map((lnk: CustomLink, idx: number) => (
                          <a key={idx} href={lnk.url.startsWith('http') ? lnk.url : `https://${lnk.url}`} target="_blank" rel="noopener noreferrer" className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-lime-400 transition-all flex items-center gap-2 text-xs font-mono">
                            <LinkIcon className="h-3.5 w-3.5 text-lime-400" /> {lnk.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {editing && (
                  <div className="bg-slate-950/90 p-6 rounded-xl border border-slate-800 space-y-4">
                    
                    {imageError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
                        {imageError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                      <div className="space-y-2">
                        <label className="text-xs text-lime-400 font-mono uppercase flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5" /> Upload Avatar Image File
                        </label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, 'avatar')} 
                          className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-lime-500/10 file:text-lime-400 hover:file:bg-lime-500/20 cursor-pointer"
                        />
                        <input 
                          value={avatarUrl} 
                          onChange={(e) => setAvatarUrl(e.target.value)} 
                          placeholder="Or paste image URL here..." 
                          className="w-full border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-950 text-white text-xs font-mono mt-1" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-lime-400 font-mono uppercase flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5" /> Upload Banner Image File
                        </label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, 'banner')} 
                          className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
                        />
                        <input 
                          value={bannerUrl} 
                          onChange={(e) => setBannerUrl(e.target.value)} 
                          placeholder="Or paste banner URL here..." 
                          className="w-full border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-950 text-white text-xs font-mono mt-1" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-lime-400 font-mono uppercase">Professional Bio / Tagline</label>
                      <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="E.g., Cybersecurity enthusiast & Ethical Hacker" className="w-full border border-slate-800 rounded-lg px-3 py-2 bg-slate-900 text-white text-sm" />
                    </div>

                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                      <label className="text-xs text-lime-400 font-mono uppercase flex items-center gap-1.5">
                        <LinkIcon className="h-3.5 w-3.5" /> Add Custom Links to Profile
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)} placeholder="Label (e.g. Portfolio)" className="border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-950 text-white text-xs font-mono" />
                        <input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="URL (https://...)" className="border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-950 text-white text-xs font-mono" />
                        <Button type="button" onClick={handleAddCustomLink} className="bg-slate-800 hover:bg-slate-700 text-lime-400 font-mono text-xs">
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
                        </Button>
                      </div>
                      {customLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {customLinks.map((lnk, idx) => (
                            <span key={idx} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md text-xs font-mono text-slate-300 flex items-center gap-2">
                              {lnk.label} <button type="button" onClick={() => handleRemoveCustomLink(idx)} className="text-red-400 hover:text-red-300"><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-lime-400 font-mono uppercase">Profile Visibility</label>
                        <select value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value as any)} className="w-full border border-slate-800 rounded-lg px-3 py-2 bg-slate-900 text-white text-sm font-mono">
                          <option value="public">Public (Instant Connect)</option>
                          <option value="private">Private (Requires Approval)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-lime-400 font-mono uppercase">Country</label>
                        <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-slate-800 rounded-lg px-3 py-2 bg-slate-900 text-white text-sm font-mono">
                          <option value="">Select Country</option>
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-lime-400 font-mono uppercase">Specialization</label>
                        <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full border border-slate-800 rounded-lg px-3 py-2 bg-slate-900 text-white text-sm font-mono">
                          <option value="">Select Domain</option>
                          {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-lime-400 font-mono uppercase">Experience Level</label>
                        <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full border border-slate-800 rounded-lg px-3 py-2 bg-slate-900 text-white text-sm font-mono">
                          <option value="">Select Level</option>
                          {EXPERIENCE_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-lime-400 font-mono uppercase">GitHub Username</label>
                        <input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="username" className="w-full border border-slate-800 rounded-lg px-3 py-2 bg-slate-900 text-white text-sm font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-lime-400 font-mono uppercase">Twitter / X Handle</label>
                        <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="username" className="w-full border border-slate-800 rounded-lg px-3 py-2 bg-slate-900 text-white text-sm font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-lime-400 font-mono uppercase">LinkedIn URL</label>
                        <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full border border-slate-800 rounded-lg px-3 py-2 bg-slate-900 text-white text-sm font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-lime-400 font-bold flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> Level {currentLevel} Progression</span>
                    <span className="text-slate-400">{currentPoints} / {nextThreshold} XP</span>
                  </div>
                  <Progress value={safeProgress} className="h-2 bg-slate-900 rounded-full overflow-hidden" />
                </div>

              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* --- STATS GRID --- */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatBox icon={Star} value={user.stats?.points || 0} label="Total XP Points" color="lime" />
          <StatBox icon={Trophy} value={`#${rank}`} label="Global Rank" color="purple" />
          <StatBox icon={Target} value={user.stats?.challengesCompleted || 0} label="Modules Completed" color="cyan" />
          <StatBox icon={Flame} value={user.stats?.scansCompleted || 0} label="Terminal Drills Run" color="orange" />
        </div>

        {/* --- TABS SECTION --- */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:max-w-xl bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <TabsTrigger value="achievements" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black font-mono text-xs rounded-lg">
              <Award className="h-3.5 w-3.5 mr-2" /> Badges ({unlockedCount}/{achievementsList.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-500 data-[state=active]:text-black font-mono text-xs rounded-lg">
              <TrendingUp className="h-3.5 w-3.5 mr-2" /> System Logs
            </TabsTrigger>
            <TabsTrigger value="operators" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-mono text-xs rounded-lg relative">
              <Users className="h-3.5 w-3.5 mr-2" /> Connect ({allOperators.length})
              {unreadSendersCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadSendersCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* --- TAB 1: BADGES --- */}
          <TabsContent value="achievements">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-white font-mono text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-lime-400" /> Operator Credentials & Badges
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Milestones unlocked through terminal drills and security labs.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAllAchievements(!showAllAchievements)} className="text-slate-400 hover:text-white font-mono text-xs">
                  {showAllAchievements ? "Show Less" : "View All"}
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(showAllAchievements ? achievementsList : achievementsList.slice(0, 6)).map((ach) => (
                    <motion.div
                      key={ach.id}
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-xl border p-4 text-left transition-all relative overflow-hidden ${
                        ach.unlocked 
                          ? "border-lime-500/30 bg-lime-500/5 shadow-[0_0_20px_-8px_rgba(132,204,22,0.25)]" 
                          : "border-slate-800/80 bg-slate-950/40 opacity-60 grayscale"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">{ach.icon}</div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-mono font-bold text-sm truncate ${ach.unlocked ? "text-white" : "text-slate-400"}`}>
                              {ach.title}
                            </h4>
                            {ach.unlocked && (
                              <span className="text-[10px] font-mono text-lime-400 bg-lime-500/10 px-1.5 py-0.5 rounded border border-lime-500/20">
                                UNLOCKED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
                        </div>
                      </div>

                      {ach.progress !== undefined && !ach.unlocked && (
                        <div className="mt-4 pt-3 border-t border-slate-800/60">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                            <span>Progress</span>
                            <span>{ach.progress}/{ach.maxProgress}</span>
                          </div>
                          <Progress value={(ach.progress / ach.maxProgress!) * 100} className="h-1 bg-slate-900" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 2: SYSTEM LOGS --- */}
          <TabsContent value="activity">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white font-mono text-lg flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-purple-400" /> Audit Trail & System Logs
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">Chronological record of your actions across the SecurityX AI platform.</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-3 font-mono">
                    {activities.map((act, index) => (
                      <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 hover:border-purple-500/30 transition-all">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-purple-400">
                           <Shield className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-200 font-medium truncate">{act.description}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(act.timestamp)}</span>
                            <span className="text-slate-700">•</span>
                            <span className="text-purple-400/80 uppercase tracking-wider text-[10px]">{act.type || "action"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 font-mono">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-20 text-purple-400" />
                    <p className="text-sm">No activity logs recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 3: CONNECT WITH OTHERS --- */}
          <TabsContent value="operators">
            <div className="space-y-6">
              
              {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-amber-400 font-mono text-sm flex items-center gap-2">
                      <UserPlus className="h-4 w-4" /> Incoming Connection Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {incomingRequests.filter(r => r.status === 'pending').map(req => {
                      const senderOp = allOperators.find(o => o.uid === req.senderUid)
                      if (!senderOp) return null
                      return (
                        <div key={req.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-amber-500/20 font-mono">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-amber-500/40">
                              <AvatarFallback className="bg-slate-900 text-amber-400">{senderOp.name.slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-white font-bold text-sm">{senderOp.name}</div>
                              <div className="text-xs text-slate-400">Wants to connect (Private Profile)</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAcceptRequest(req)} className="bg-lime-500 hover:bg-lime-400 text-black font-mono text-xs">Accept</Button>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white font-mono text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-400" /> Platform Operators Directory
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Connect with other operators on SecurityX AI. Public profiles connect instantly; private profiles require connection approval.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allOperators.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-mono">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-20 text-cyan-400" />
                      <p className="text-sm">No other operators found online yet.</p>
                      <p className="text-xs text-slate-600 mt-1">Once multiple users register, they will appear here!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allOperators.map((op) => {
                        const isConnected = connections.includes(op.uid)
                        const isPrivate = op.profileVisibility === "private"
                        const sentReq = sentRequests.find(r => r.receiverUid === op.uid && r.status === 'pending')

                        const chatWithOp = allMessagesMap[op.uid] || []
                        const unreadFromOp = chatWithOp.filter(m => m.senderUid === op.uid && !m.read).length

                        return (
                          <div key={op.uid} className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 hover:from-cyan-500/50 hover:to-lime-500/50 transition-all duration-300 shadow-xl">
                            <div className="bg-slate-950/95 rounded-2xl p-5 flex flex-col justify-between space-y-4 h-full relative overflow-hidden">
                              
                              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-lime-500/10 transition-all" />

                              <div className="flex items-start gap-4">
                                <div 
                                  className={`relative shrink-0 ${isConnected ? 'cursor-pointer' : ''}`}
                                  onClick={() => {
                                    if (isConnected) setViewingOperator(op)
                                  }}
                                >
                                  <Avatar className="h-14 w-14 rounded-xl border-2 border-slate-800 group-hover:border-cyan-500/50 transition-all shadow-md">
                                    {op.avatarUrl ? <AvatarImage src={op.avatarUrl} className="object-cover" /> : null}
                                    <AvatarFallback className="bg-slate-900 text-lime-400 font-mono font-bold text-base rounded-xl">
                                      {op.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-lime-400 border-2 border-slate-950 shadow" />
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                  <div 
                                    onClick={() => {
                                      if (isConnected) setViewingOperator(op)
                                    }}
                                    className={`text-white font-bold font-mono text-base truncate transition-colors ${isConnected ? 'cursor-pointer hover:text-cyan-400 hover:underline' : ''}`}
                                  >
                                    {op.name}
                                  </div>
                                  <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                                    <Terminal className="h-3 w-3 text-lime-400" /> Level {op.level} Operator
                                  </div>
                                  {(!isPrivate || isConnected) && op.specialization && (
                                    <Badge variant="outline" className="mt-1.5 text-[10px] border-cyan-500/30 text-cyan-400 bg-cyan-500/10 font-mono">
                                      {op.specialization}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-900 flex items-center justify-between font-mono">
                                <span className={`text-[10px] uppercase flex items-center gap-1.5 ${isPrivate ? 'text-purple-400' : 'text-cyan-400'}`}>
                                  {isPrivate ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                                  {op.profileVisibility}
                                </span>

                                <div className="flex items-center gap-2">
                                  {isConnected ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setViewingOperator(op)}
                                        className="border-lime-500/40 text-lime-400 bg-lime-500/10 text-[11px] h-7 px-2.5 hover:bg-lime-500/20"
                                      >
                                        <UserCheck className="h-3.5 w-3.5 mr-1 inline" /> Dossier
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        onClick={() => {
                                          if ((window as any).__openChatWithUser) {
                                            (window as any).__openChatWithUser(op.uid);
                                          }
                                        }} 
                                        className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] relative h-7 px-2.5"
                                      >
                                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                                        {unreadFromOp > 0 && (
                                          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-slate-950 animate-pulse">
                                            {unreadFromOp}
                                          </span>
                                        )}
                                      </Button>
                                    </>
                                  ) : sentReq ? (
                                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                                      Request Sent
                                    </span>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleConnect(op)}
                                      className="bg-lime-500/10 border border-lime-500/40 text-lime-400 hover:bg-lime-500/20 text-xs"
                                    >
                                      <UserPlus className="h-3.5 w-3.5 mr-1.5" /> {isPrivate ? "Send Request" : "Connect"}
                                    </Button>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>

        {/* --- DANGER ZONE --- */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mt-12 border-red-500/20 bg-red-950/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400 font-mono text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h4 className="text-white font-mono font-medium text-sm">Purge Operator Account</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Permanently wipe your account data, XP points, terminal drill statistics, and badges from Firebase. This action is irreversible.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount} 
                  disabled={isDeleting}
                  className="bg-red-600/80 hover:bg-red-600 text-white font-mono text-xs whitespace-nowrap"
                >
                  {isDeleting ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Purging...</>
                  ) : (
                    <><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Account</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* --- CONNECTED USER FULL PROFILE DOSSIER MODAL (LINKEDIN STYLE) --- */}
      <AnimatePresence>
        {viewingOperator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-[#0f141f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative font-mono text-slate-300"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-lime-400" /> Operator Dossier (Connected View)
                </span>
                <button
                  onClick={() => setViewingOperator(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-xl border border-slate-700">
                    {viewingOperator.avatarUrl ? <AvatarImage src={viewingOperator.avatarUrl} className="object-cover" /> : null}
                    <AvatarFallback className="bg-slate-900 text-lime-400 font-bold text-lg">
                      {viewingOperator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-white font-mono">{viewingOperator.name}</h2>
                    <p className="text-xs text-lime-400 mt-0.5">Level {viewingOperator.level} Security Operator</p>
                    {viewingOperator.specialization && (
                      <Badge variant="outline" className="mt-2 text-[10px] border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                        {viewingOperator.specialization}
                      </Badge>
                    )}
                  </div>
                </div>

                {viewingOperator.bio && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                    "{viewingOperator.bio}"
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase tracking-wider">Country</span>
                    <span className="text-slate-200">{viewingOperator.country || "Not specified"}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase tracking-wider">Experience Level</span>
                    <span className="text-slate-200">{viewingOperator.experienceLevel || "Not specified"}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block mb-1">Email Contact</span>
                    <span className="text-slate-200">{viewingOperator.email || "Not shared"}</span>
                  </div>

                  {(viewingOperator.github || viewingOperator.twitter || viewingOperator.linkedin || (viewingOperator.customLinks && viewingOperator.customLinks.length > 0)) && (
                    <div className="pt-2">
                      <span className="text-slate-500 uppercase tracking-wider block mb-2">Connected Channels & Links</span>
                      <div className="flex flex-wrap gap-2">
                        {viewingOperator.github && (
                          <a href={`https://github.com/${viewingOperator.github.replace('@', '').replace('https://github.com/', '')}`} target="_blank" rel="noopener noreferrer" className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono">
                            <Github className="h-3 w-3" /> GitHub
                          </a>
                        )}
                        {viewingOperator.twitter && (
                          <a href={`https://twitter.com/${viewingOperator.twitter.replace('@', '').replace('https://twitter.com/', '')}`} target="_blank" rel="noopener noreferrer" className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-[#1DA1F2] transition-all flex items-center gap-1.5 text-xs font-mono">
                            <Twitter className="h-3 w-3" /> Twitter
                          </a>
                        )}
                        {viewingOperator.linkedin && (
                          <a href={viewingOperator.linkedin.startsWith('http') ? viewingOperator.linkedin : `https://${viewingOperator.linkedin}`} target="_blank" rel="noopener noreferrer" className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-[#0A66C2] transition-all flex items-center gap-1.5 text-xs font-mono">
                            <Linkedin className="h-3 w-3" /> LinkedIn
                          </a>
                        )}
                        {viewingOperator.customLinks && viewingOperator.customLinks.map((lnk, idx) => (
                          <a key={idx} href={lnk.url.startsWith('http') ? lnk.url : `https://${lnk.url}`} target="_blank" rel="noopener noreferrer" className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-lime-400 transition-all flex items-center gap-1.5 text-xs font-mono">
                            <LinkIcon className="h-3 w-3 text-lime-400" /> {lnk.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex justify-end gap-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      const uid = viewingOperator.uid
                      setViewingOperator(null)
                      if ((window as any).__openChatWithUser) {
                        (window as any).__openChatWithUser(uid)
                      }
                    }}
                    className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold text-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Open Secure Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CyberWrapper>
  )
}

function StatBox({ icon: Icon, value, label, color }: any) {
  const colors: Record<string, string> = { 
    lime: "text-lime-400 bg-lime-400/10 border-lime-500/20", 
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-500/20", 
    purple: "text-purple-400 bg-purple-400/10 border-cyan-500/20",
    orange: "text-orange-400 bg-orange-400/10 border-orange-500/20" 
  }

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <div className={`rounded-xl border bg-slate-900/60 backdrop-blur-sm p-5 flex items-center gap-4 ${colors[color]?.split(" ")[2] || 'border-slate-800'} shadow-lg`}>
        <div className={`p-3 rounded-xl ${colors[color]?.split(" ")[1]} ${colors[color]?.split(" ")[0]} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl md:text-2xl font-bold text-white font-mono truncate">{value}</div>
          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">{label}</div>
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