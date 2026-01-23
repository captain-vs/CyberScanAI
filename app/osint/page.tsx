"use client"

import Link from "next/link"
import {
  Globe,
  Database,
  FileSearch,
  Users,
  Mail,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  Search,
  Lock,
  Eye,
  Server
} from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CyberWrapper } from "@/components/cyber-wrapper"


const tools = [
  {
    name: "Dark Web Monitoring",
    description: "Check if an email appears in known data breaches.",
    href: "/osint/darkweb",
    icon: ShieldAlert,
    color: "text-red-500",
    borderColor: "hover:border-red-500/50",
    bgGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]"
  },
  {
    name: "WHOIS Lookup",
    description: "Retrieve domain registration and ownership data.",
    href: "/osint/whois",
    icon: Globe,
    color: "text-cyan-400",
    borderColor: "hover:border-cyan-500/50",
    bgGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]"
  },
  {
    name: "DNS Recon",
    description: "Explore DNS records like A, MX, TXT, and NS.",
    href: "/osint/dns",
    icon: Server,
    color: "text-lime-400",
    borderColor: "hover:border-lime-500/50",
    bgGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(163,230,53,0.3)]"
  },
  {
    name: "Metadata Extractor",
    description: "Analyze files for hidden metadata information.",
    href: "/osint/metadata",
    icon: FileSearch,
    color: "text-yellow-400",
    borderColor: "hover:border-yellow-500/50",
    bgGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(250,204,21,0.3)]"
  },
  {
    name: "Social Media Checker",
    description: "Find public social profiles linked to a username.",
    href: "/osint/social",
    icon: Users,
    color: "text-purple-400",
    borderColor: "hover:border-purple-500/50",
    bgGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(192,132,252,0.3)]"
  },
  {
    name: "Email Harvester",
    description: "Discover publicly available emails for a domain.",
    href: "/osint/email",
    icon: Mail,
    color: "text-orange-400",
    borderColor: "hover:border-orange-500/50",
    bgGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(251,146,60,0.3)]"
  },
]

export default function OSINTHub() {
  return (
    <AuthGuard>
      <CyberWrapper>
        <div className="container mx-auto px-4 py-12">
          
          {/* HEADER */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center p-2 rounded-full bg-slate-900/50 border border-slate-800 mb-4 px-4">
               <Eye className="w-4 h-4 mr-2 text-cyan-400" />
               <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Open Source Intelligence</span>
            </div>
            <h1 className="mb-4 text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              OSINT <span className="text-cyan-400">Hub</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Advanced reconnaissance tools for ethical research and defensive awareness.
            </p>
          </motion.div>

          {/* ⭐ FEATURED GUIDE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <Link href="/osint/guide">
              <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0f141f] p-8 hover:border-cyan-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="p-4 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      OSINT Basics & Ethical Protocols
                    </h2>
                    <p className="text-slate-400 max-w-2xl">
                      Start here to understand the legal boundaries, investigation methodologies, and responsible disclosure practices before using the tools.
                    </p>
                  </div>
                  <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold">
                    Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 🔧 TOOLS GRID */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link href={tool.href} className="block h-full">
                    <Card className={`group h-full border-slate-800 bg-[#0f141f] hover:bg-[#0B1520] transition-all duration-300 ${tool.borderColor} ${tool.bgGlow}`}>
                      <CardHeader>
                        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <CardTitle className="text-xl text-white group-hover:text-white transition-colors flex items-center justify-between">
                          {tool.name}
                          <ArrowRight className={`h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${tool.color}`} />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-400 text-sm leading-relaxed">
                          {tool.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* ⚠️ DISCLAIMER */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-red-900/50 bg-red-900/10 text-red-400 text-sm">
              <Lock className="h-3 w-3" />
              <span>Use strictly for educational and defensive purposes only.</span>
            </div>
          </motion.div>

        </div>
      </CyberWrapper>
    </AuthGuard>
  )
}