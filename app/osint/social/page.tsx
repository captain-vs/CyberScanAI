"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  Users,
  Search,
  ExternalLink,
  Shield,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Activity,
  User,
  Fingerprint
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants, Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { socialCheck } from "@/lib/osint/social"

export default function SocialMediaPage() {
  const [username, setUsername] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return
    setLoading(true)
    setResult(null)

    try {
      const data = await socialCheck(username)
      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        
        <Link
          href="/osint"
          className={cn(buttonVariants({ variant: "ghost" }), "mb-8 text-slate-400 hover:text-white hover:bg-slate-800")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to OSINT Hub
        </Link>

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]">
            <Fingerprint className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Identity <span className="text-purple-400">Recon</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Deep scan username usage to correlate digital identities across the web.
          </p>
        </div>

        {/* INPUT AREA */}
        <Card className="max-w-xl mx-auto bg-[#0f141f] border-slate-800 shadow-xl mb-12">
          <CardHeader>
            <CardTitle className="text-white">Target Username</CardTitle>
            <CardDescription className="text-slate-400">Enter a username to begin footprint analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheck} className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="e.g. cyber_ninja"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold min-w-[100px]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                {loading ? "Scanning" : "Trace"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RESULTS DASHBOARD */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* SUMMARY STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 flex items-center gap-4">
                   <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                     <Users className="h-6 w-6" />
                   </div>
                   <div>
                     <p className="text-sm text-slate-400">Profiles Found</p>
                     <p className="text-2xl font-bold text-white">{result.totalFound}</p>
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 flex items-center gap-4">
                   <div className={`p-3 rounded-full ${result.exposureLevel === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                     <AlertTriangle className="h-6 w-6" />
                   </div>
                   <div>
                     <p className="text-sm text-slate-400">Exposure Risk</p>
                     <p className="text-2xl font-bold text-white">{result.exposureLevel}</p>
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 flex items-center gap-4">
                   <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                     <Activity className="h-6 w-6" />
                   </div>
                   <div>
                     <p className="text-sm text-slate-400">Scan Time</p>
                     <p className="text-2xl font-bold text-white">{result.scanTime}</p>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* DETAILED HIT LIST */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4 pl-1">Detailed Findings</h3>
              
              {result.profiles.map((profile: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-slate-800 bg-[#0f141f] hover:border-purple-500/30 transition-all group overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                        
                        {/* LEFT: AVATAR & PLATFORM */}
                        <div className="flex items-center gap-4 min-w-[200px]">
                          <div className={`h-12 w-12 rounded-full ${profile.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {profile.platform[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">{profile.platform}</h4>
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-xs">
                              {profile.category}
                            </Badge>
                          </div>
                        </div>

                        {/* MIDDLE: METADATA & BIO */}
                        <div className="flex-1 space-y-2 border-l border-slate-800 pl-6 border-dashed md:border-solid">
                           <div className="flex items-center gap-2 text-sm text-slate-300">
                             <span className="font-mono text-purple-400">@{profile.username}</span>
                             <span className="text-slate-600">•</span>
                             <span className="text-slate-500">Last seen: {profile.lastActive}</span>
                           </div>
                           <p className="text-sm text-slate-400 italic">"{profile.bio}"</p>
                           
                           {/* Match Confidence Bar */}
                           <div className="flex items-center gap-3 mt-2">
                             <span className="text-xs text-slate-500">Match Confidence:</span>
                             <Progress 
                               value={profile.confidence} 
                               className="h-1.5 w-24 bg-slate-800 [&>*]:bg-green-500" 
                             />
                             <span className="text-xs text-green-400 font-mono">{profile.confidence}%</span>
                           </div>
                        </div>

                        {/* RIGHT: ACTION */}
                        <div className="flex items-center justify-end">
                           <a 
                             href={profile.url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                           >
                             <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2">
                               View Profile <ExternalLink className="h-4 w-4" />
                             </Button>
                           </a>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-xs text-slate-600 mt-12">
              {result.disclaimer}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}