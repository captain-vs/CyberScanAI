"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, TrendingUp, Clock, User, ArrowRight, Search, Star, ExternalLink, Loader2, Shield, Lock, Zap, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import AuthGuard from "@/components/auth-guard"

// --- TYPES ---
type ContentItem = {
  id: string
  title: string
  description: string
  category: string
  readTime: string
  author: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  image?: string
  url?: string
}

// --- STATIC DATA ---
const tutorials: ContentItem[] = [
  {
    id: "t1",
    title: "Complete Guide to 2FA & Auth Security",
    description: "Interactive Lab: Configure Two-Factor Authentication and understand backup codes.",
    category: "Authentication",
    readTime: "10 min",
    author: "Sarah Chen",
    difficulty: "Beginner",
  },
  {
    id: "t2",
    title: "SQL Injection: Attack & Defense",
    description: "Interactive Lab: Perform a real SQL injection attack on a simulated database.",
    category: "Web Security",
    readTime: "15 min",
    author: "Michael Torres",
    difficulty: "Intermediate",
  },
  {
    id: "t5",
    title: "XSS (Cross-Site Scripting) Mastery",
    description: "Interactive Lab: Inject malicious scripts into a vulnerable comment section.",
    category: "Web Security",
    readTime: "12 min",
    author: "Dr. James Wilson",
    difficulty: "Intermediate",
  },
  {
    id: "t6",
    title: "Password Cracking & Hash Analysis",
    description: "Interactive Lab: Understand how hackers crack passwords and how to secure them.",
    category: "Cryptography",
    readTime: "10 min",
    author: "Robert Lee",
    difficulty: "Beginner",
  },
  {
    id: "t7",
    title: "Command Injection: Owning the Server",
    description: "Interactive Lab: Learn how attackers execute OS commands via vulnerable inputs.",
    category: "Network Security",
    readTime: "15 min",
    author: "System Admin",
    difficulty: "Advanced",
  },
  {
    id: "t8",
    title: "Path Traversal: Stealing Config Files",
    description: "Interactive Lab: Manipulate file paths to access restricted server directories.",
    category: "Web Security",
    readTime: "12 min",
    author: "Web Admin",
    difficulty: "Intermediate",
  },
]

const articles: ContentItem[] = [
  {
    id: "a4",
    title: "Inside the Dark Web: Markets & Myths",
    description: "An investigative look into TOR networks, silk road successors, and the reality of the dark web economy.",
    category: "Dark Web",
    readTime: "25 min",
    author: "Cipher Collective",
    difficulty: "Advanced",
  },
  {
    id: "a5",
    title: "Ransomware 2.0: Double Extortion Tactics",
    description: "How modern ransomware gangs not only encrypt data but threaten to leak it. Analysis of LockBit and BlackCat.",
    category: "Threat Analysis",
    readTime: "18 min",
    author: "ThreatIntel Team",
    difficulty: "Intermediate",
  },
  {
    id: "a6",
    title: "The Anatomy of a Supply Chain Attack",
    description: "Deconstructing the SolarWinds hack and how to secure software dependencies.",
    category: "Enterprise Security",
    readTime: "20 min",
    author: "Emily Rodriguez",
    difficulty: "Advanced",
  },
]

function LearnContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [newsItems, setNewsItems] = useState<ContentItem[]>([])
  const [loadingNews, setLoadingNews] = useState(true)

  // Fetch News Logic (Unchanged)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true)
        const response = await fetch("/api/news?query=cybersecurity")
        const data = await response.json()

        if (data.articles) {
          const formattedNews: ContentItem[] = data.articles.slice(0, 9).map((article: any, index: number) => ({
            id: `news-${index}`,
            title: article.title || "Untitled Article",
            description: article.description || "No description available",
            category: "Cybersecurity News",
            readTime: "5 min",
            author: article.source?.name || "Unknown",
            difficulty: "Intermediate" as const,
            image: article.urlToImage,
            url: article.url,
          }))
          setNewsItems(formattedNews)
        }
      } catch (error) {
        console.error("Failed to fetch news:", error)
      } finally {
        setLoadingNews(false)
      }
    }
    fetchNews()
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
      case "Intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "Advanced": return "bg-red-500/20 text-red-400 border-red-500/50"
      default: return "bg-slate-500/20 text-slate-400"
    }
  }

  const filterContent = (items: ContentItem[]) => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDifficulty = selectedDifficulty === null || item.difficulty === selectedDifficulty
      return matchesSearch && matchesDifficulty
    })
  }

  const renderContentCard = (item: ContentItem) => (
    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Link href={item.url || `/learn/article/${item.id}`} target={item.url ? "_blank" : "_self"}>
        <Card className="group h-full bg-[#0b0f17] border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]">
          {item.image && (
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] to-transparent z-10" />
              <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
            </div>
          )}
          <CardHeader>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">{item.category}</Badge>
              <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>{item.difficulty}</Badge>
            </div>
            <CardTitle className="line-clamp-2 text-xl text-white group-hover:text-blue-400 transition-colors">{item.title}</CardTitle>
            <CardDescription className="line-clamp-2 text-slate-400">{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1"><User className="h-3 w-3" /> {item.author}</div>
              <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.readTime}</div>
            </div>
            <Button variant="outline" className="w-full border-slate-700 bg-slate-900/50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
              {item.url ? "Read External Source" : "Start Module"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-black text-slate-200 relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        
        {/* HERO */}
        <div className="mb-12 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] mb-6">
            <BookOpen className="h-8 w-8 text-emerald-500" />
          </motion.div>
          <h1 className="mb-4 text-5xl font-black text-white tracking-tighter">EDUCATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">HUB</span></h1>
          <p className="text-lg text-slate-400">Master cybersecurity with interactive labs, live threat news, and expert articles.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="mx-auto mb-12 max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input 
            type="search" 
            placeholder="Search topics (e.g., 'Phishing', 'SQL', 'Dark Web')..." 
            className="pl-12 h-14 bg-slate-900/50 border-slate-800 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* TABS */}
        <Tabs defaultValue="tutorials" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:mx-auto lg:max-w-md bg-slate-900/80 border border-slate-800 h-auto p-1">
            {[
              { id: "news", icon: TrendingUp, label: "Threat News" },
              { id: "tutorials", icon: Terminal, label: "Interactive Labs" },
              { id: "articles", icon: Shield, label: "Knowledge Base" }
            ].map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex gap-2 items-center justify-center">
                <tab.icon className="h-4 w-4" /> <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* NEWS TAB */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="text-red-500"/> Live Cyber Threats</h2>
            </div>
            {loadingNews ? (
              <div className="h-64 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin h-8 w-8 mr-2"/> Fetching intelligence...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filterContent(newsItems).map(renderContentCard)}</div>
            )}
          </TabsContent>

          {/* TUTORIALS TAB (With Filter inside) */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Terminal className="text-emerald-500"/> Training Labs</h2>
                <p className="text-sm text-slate-400">Hands-on simulation environments.</p>
              </div>
              
              {/* FILTER BUTTONS MOVED HERE */}
              <div className="flex gap-2">
                {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
                  <Button 
                    key={level}
                    size="sm" 
                    variant={selectedDifficulty === (level === "All" ? null : level) ? "default" : "outline"}
                    onClick={() => setSelectedDifficulty(level === "All" ? null : level)}
                    className={selectedDifficulty === (level === "All" ? null : level) ? "bg-emerald-600 hover:bg-emerald-700" : "bg-transparent border-slate-700 text-slate-300"}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filterContent(tutorials).map(renderContentCard)}</div>
          </TabsContent>

          {/* ARTICLES TAB */}
          <TabsContent value="articles" className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="text-purple-500"/> Deep Dives & Reports</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filterContent(articles).map(renderContentCard)}</div>
          </TabsContent>
        </Tabs>

        {/* FEATURED RESOURCES (Animated) */}
        <div className="mt-20">
          <h2 className="mb-8 text-3xl font-bold text-center text-white">Essential <span className="text-blue-500">Arsenal</span></h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            
            {/* Certifications */}
            <motion.div whileHover={{ scale: 1.02 }} className="h-full">
              <Card className="h-full bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white"><Shield className="h-6 w-6 text-purple-500" /> Certification Paths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "CompTIA Security+", url: "https://www.comptia.org/certifications/security", color: "text-red-400" },
                    { name: "OSCP (OffSec)", url: "https://www.offsec.com/courses/pen-200/", color: "text-emerald-400" },
                    { name: "CEH (Ethical Hacker)", url: "https://www.ec-council.org", color: "text-blue-400" }
                  ].map((cert, i) => (
                    <Button key={i} asChild variant="ghost" className="w-full justify-between hover:bg-slate-800 text-slate-300">
                      <a href={cert.url} target="_blank">{cert.name} <ExternalLink className={`h-4 w-4 ${cert.color}`} /></a>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tools */}
            <motion.div whileHover={{ scale: 1.02 }} className="h-full">
              <Card className="h-full bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white"><Zap className="h-6 w-6 text-orange-500" /> Battle Tested Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Kali Linux", url: "https://www.kali.org/", color: "text-blue-400" },
                    { name: "Metasploit", url: "https://www.metasploit.com/", color: "text-orange-400" },
                    { name: "Burp Suite", url: "https://portswigger.net/burp", color: "text-orange-600" },
                    { name: "Wireshark", url: "https://www.wireshark.org/", color: "text-blue-500" }
                  ].map((tool, i) => (
                    <Button key={i} asChild variant="ghost" className="w-full justify-between hover:bg-slate-800 text-slate-300">
                      <a href={tool.url} target="_blank">{tool.name} <ExternalLink className={`h-4 w-4 ${tool.color}`} /></a>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default function LearnPage() {
  return <AuthGuard><Suspense fallback={<div className="text-white p-10">Loading Hub...</div>}><LearnContent /></Suspense></AuthGuard>
}