"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shield,
  Scan,
  BookOpen,
  Gamepad2,
  TrendingUp,
  Lock,
  Search,
  FileCheck,
  Globe,
  ImageIcon,
  ArrowRight,
  Zap,
  Users,
  Award,
  CheckCircle2,
  Hash,
  Beaker,
  Eye,
  Shell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CyberWrapper } from "@/components/cyber-wrapper"



export default function Home() {
  const router = useRouter()

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      router.replace("/dashboard")
    }
  })

  return () => unsubscribe()
}, [router])

 

  return (
    <CyberWrapper>
      <div className="min-h-screen">
        
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          <div className="container relative mx-auto px-4 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-4xl text-center"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-4 py-2 text-sm text-lime-400 backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                <span className="font-mono tracking-wide">LEARN • PRACTICE • GROW</span>
              </div>
              
              <h1 className="mb-6 text-5xl font-black tracking-tighter md:text-7xl text-white">
                Security<span className="text-lime-400">X</span>
              </h1>
              
              <p className="mb-10 text-xl text-slate-100 md:text-2xl max-w-2xl mx-auto leading-relaxed">
                A cybersecurity learning platform for beginners. <span className="text-slate-300">Explore lessons</span>, <span className="text-white">quizzes, guided challenges</span>, and <span className="text-white">safe educational simulations</span>.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="text-lg bg-lime-500 hover:bg-lime-400 text-black font-bold h-14 px-8 rounded-xl shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] transition-all">
                  <Link href="/auth?mode=register">
                    <Shield className="mr-2 h-5 w-5" />
                    Initialize System
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800 hover:text-lime-400 h-14 px-8 rounded-xl">
                  <Link href="/auth?mode=login">Login Access</Link>
                </Button>
              </div>
            </motion.div>
          </div>
          
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none" />
        </section>

        {/* FEATURES GRID (4 HUBS) */}
        <section className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white">Learning Areas</h2>
            <p className="text-lg text-slate-400">Practical ways to explore cybersecurity concepts</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            {/* 1. Scanning Hub */}
            <HubCard 
              icon={Scan}
              title="Scanning Hub"
              desc="AI-Powered Threat Detection"
              color="text-blue-400"
              bgColor="bg-blue-400/10"
              borderColor="hover:border-blue-400/50"
              items={[
                { icon: Globe, label: "URL & Domain Scanner" },
                { icon: FileCheck, label: "Malware Detection" },
                { icon: Search, label: "IP Intelligence" },
                { icon: Hash, label: "Crypto Hash Tools" }
              ]}
            />

            {/* 2. Education Hub */}
            <HubCard 
              icon={BookOpen}
              title="Education Hub"
              desc="Tactical Knowledge Base"
              color="text-emerald-400"
              bgColor="bg-emerald-400/10"
              borderColor="hover:border-emerald-400/50"
              items={[
                { icon: TrendingUp, label: "Security Briefings" },
                { icon: Beaker, label: "Interactive Labs" },
                { icon: Zap, label: "Quick Tips" },
                { icon: FileCheck, label: "In-depth Articles" }
              ]}
            />

            {/* 3. GameZone */}
            <HubCard 
              icon={Gamepad2}
              title="GameZone"
              desc="Competitive Cyber Arena"
              color="text-purple-400"
              bgColor="bg-purple-400/10"
              borderColor="hover:border-purple-400/50"
              items={[
                { icon: Award, label: "CTF Challenges" },
                { icon: Lock, label: "Skill Quizzes" },
                { icon: Users, label: "Global Leaderboard" },
                { icon: Award, label: "Earn Badges" }
              ]}
            />

            {/* 4. OSINT Hub (NEW) */}
            <HubCard 
              icon={Eye}
              title="OSINT Hub"
              desc="Open Source Intelligence"
              color="text-orange-400"
              bgColor="bg-orange-400/10"
              borderColor="hover:border-orange-400/50"
              items={[
                { icon: Search, label: "Username Recon" },
                { icon: Globe, label: "Domain Intel" },
                { icon: ImageIcon, label: "Reverse Image Search" },
                { icon: FileCheck, label: "Public Data Exposure" }
              ]}
            />

          </div>
        </section>

        {/* WORKING FEATURES LIST */}
        <section className="border-y border-slate-800 bg-slate-900/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">What You Can Learn</h2>
              <p className="text-slate-400">Lessons, challenges, and guided practice for beginners</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Educational Analysis Tools", desc: "Practice interpreting inputs and security signals in a learning environment", color: "text-blue-400" },
                { title: "Interactive Labs", desc: "SQLi, XSS, and 2FA practice environments", color: "text-emerald-400" },
                { title: "15+ Challenges", desc: "Gamified hacking simulations", color: "text-purple-400" },
                { title: "Skill Roadmap", desc: "Track progress from Novice to Pro", color: "text-lime-400" },
                { title: "Hash Tools", desc: "Generate & Decode cryptographic hashes", color: "text-pink-400" },
                { title: "Secure Auth", desc: "Protected user profiles & progress tracking", color: "text-orange-400" }
              ].map((feat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 flex gap-4"
                >
                  <CheckCircle2 className={`h-6 w-6 ${feat.color}`} />
                  <div>
                    <h3 className="font-bold text-white mb-1">{feat.title}</h3>
                    <p className="text-sm text-slate-400">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
             <StatItem value="Learn" label="Security Fundamentals" color="text-blue-400" />
              <StatItem value="Practice" label="Interactive Challenges" color="text-emerald-400" />
              <StatItem value="Track" label="Your Learning Progress" color="text-purple-400" />
              <StatItem value="Explore" label="Safe OSINT Simulations" color="text-orange-400" />
              
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-20">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl border border-lime-500/30 bg-gradient-to-br from-slate-900 via-[#0f141f] to-black p-12 text-center"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-lime-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Shield className="h-16 w-16 text-lime-400 mx-auto mb-6" />
              <h2 className="mb-4 text-4xl font-bold text-white">Ready to Start Your Mission?</h2>
              <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                Join the network. Secure your future. Become an elite cybersecurity operative today.
              </p>
              <Button size="lg" asChild className="bg-500 hover:bg-400 text-black font-bold h-12 px-8 text-lg">
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
  <Button
    size="lg"
    asChild
    className="bg-lime-500 hover:bg-lime-400 text-black font-bold h-12 px-8 text-lg"
  >
    <Link href="/auth?mode=register">
      Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
    </Link>
  </Button>

  <Button
    size="lg"
    variant="outline"
    asChild
    className="bg-lime-500 hover:bg-lime-400 text-black font-bold h-12 px-8 text-lg"
  >
    <Link href="/guides">
      <BookOpen className="mr-2 h-5 w-5" />
      Explore Free Guides
    </Link>
  </Button>
</div>
                
                
              </Button>
            </div>
          </motion.div>
        </section>

      </div>
    </CyberWrapper>
  )
}

// --- SUB-COMPONENTS ---

function HubCard({ icon: Icon, title, desc, color, bgColor, borderColor, items }: any) {
  return (
    <motion.div whileHover={{ y: -10 }} className="h-full">
      <Card className={`h-full bg-slate-900/50 border-slate-800 transition-all duration-300 ${borderColor} group`}>
        <CardHeader>
          <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${bgColor} transition-transform group-hover:scale-110`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <CardTitle className="text-2xl text-white group-hover:text-white transition-colors">{title}</CardTitle>
          <CardDescription className="text-slate-400">{desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-300 group-hover:text-white transition-colors">
              <item.icon className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
              <span>{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatItem({ value, label, color }: any) {
  return (
    <div className="text-center py-4">
      <div className={`mb-2 text-5xl font-black ${color} tracking-tighter`}>{value}</div>
      <div className="text-sm font-mono text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  )
}