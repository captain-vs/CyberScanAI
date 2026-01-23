"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  Globe,
  Database,
  ShieldAlert,
  FileSearch,
  Users,
  Mail,
  Radar,
  Scale,
  CheckCircle2,
  Lock
} from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
}

export default function OSINTGuide() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200">
      {/* 🟢 INCREASED WIDTH: max-w-7xl */}
      <div className="container max-w-7xl mx-auto px-4 py-12">

        {/* BACK BUTTON */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            href="/osint"
            className={cn(buttonVariants({ variant: "ghost" }), "mb-8 text-slate-400 hover:text-white hover:bg-slate-800")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to OSINT Hub
          </Link>
        </motion.div>

        {/* HERO SECTION - Centered but responsive */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fade}
          custom={0}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
             <Radar className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            OSINT <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-lime-400">Mastery Guide</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            Understand the digital footprint. Learn how cybersecurity professionals collect public data to defend systems—legally and ethically.
          </p>
        </motion.div>

        {/* PHASE 1: CONCEPT CARD */}
        <motion.div variants={fade} initial="hidden" animate="visible" custom={1}>
          <Card className="mb-16 border-l-4 border-l-lime-400 border-y-slate-800 border-r-slate-800 bg-[#0f141f] shadow-lg shadow-lime-900/10">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                 <Badge variant="outline" className="border-lime-500/50 text-lime-400 bg-lime-500/10">
                   Core Concept
                 </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl text-white">
                What is Open Source Intelligence?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-400 leading-relaxed text-base md:text-lg">
              <p className="mb-4">
                <strong>OSINT</strong> is the practice of collecting data from publicly available sources to be used in an intelligence context. In cybersecurity, "public" doesn't just mean "on Google"—it includes DNS records, SSL certificates, metadata, and social footprints.
              </p>
              <p>
                <span className="text-white font-medium">Attackers</span> use this data to map attack surfaces. 
                <span className="text-lime-400 font-medium ml-1">Defenders</span> must learn these same techniques to identify leaks and harden infrastructure before it's exploited.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* TOOLS GRID - 🟢 UPDATED: 3 Columns on Large Screens */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* WHOIS */}
          <ToolCard 
            icon={Globe} 
            title="Whois Lookup" 
            color="text-cyan-400" 
            borderColor="hover:border-cyan-500/50"
            desc="The 'Birth Certificate' of a domain."
            points={[
              "Identify domain ownership & registration dates",
              "Detect 'typosquatting' (fake domains like g0ogle.com)",
              "Map organizational infrastructure"
            ]}
            index={2}
          />

          {/* DNS */}
          <ToolCard 
            icon={Database} 
            title="DNS Recon" 
            color="text-lime-400" 
            borderColor="hover:border-lime-500/50"
            desc="The technical roadmap of a target."
            points={[
              "Find mail servers (MX Records) to prevent spoofing",
              "Discover hidden subdomains (admin.site.com)",
              "Audit SPF/DMARC records for email security"
            ]}
            index={3}
          />

          {/* DARK WEB */}
          <ToolCard 
            icon={ShieldAlert} 
            title="Dark Web Monitoring" 
            color="text-red-500" 
            borderColor="hover:border-red-500/50"
            desc="Tracking compromised identities."
            points={[
              "Check if employee credentials are sold on markets",
              "Understand the 'lifecycle' of a data breach",
              "Enforce password rotation policies immediately"
            ]}
            index={4}
          />

          {/* METADATA */}
          <ToolCard 
            icon={FileSearch} 
            title="Metadata Extractor" 
            color="text-yellow-400" 
            borderColor="hover:border-yellow-500/50"
            desc="Hidden data inside files."
            points={[
              "Reveal GPS coordinates from photos",
              "Identify software versions & usernames in PDFs",
              "Prevent accidental internal data leaks"
            ]}
            index={5}
          />

          {/* SOCIAL */}
          <ToolCard 
            icon={Users} 
            title="Social Intelligence" 
            color="text-purple-400" 
            borderColor="hover:border-purple-500/50"
            desc="Mapping the human attack surface."
            points={[
              "Correlate usernames across platforms",
              "Identify potential phishing targets",
              "Detect impersonation accounts"
            ]}
            index={6}
          />

          {/* EMAIL */}
          <ToolCard 
            icon={Mail} 
            title="Email Exposure" 
            color="text-orange-400" 
            borderColor="hover:border-orange-500/50"
            desc="Validating communication channels."
            points={[
              "Verify if an email address exists effectively",
              "Identify corporate naming conventions",
              "Assess vulnerability to targeted phishing"
            ]}
            index={7}
          />

        </div>

        {/* ETHICS SECTION */}
        <motion.div variants={fade} initial="hidden" animate="visible" custom={8}>
          <div className="mt-16 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/10 to-[#0f141f] p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="p-4 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <Scale className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  The Golden Rules of OSINT
                </h2>
                <p className="text-slate-400 mb-6">
                  With great power comes great responsibility. Misuse of these tools can violate privacy laws and get you banned or prosecuted.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-950/30 border border-red-500/10">
                    <Lock className="h-5 w-5 text-red-400 mt-0.5" />
                    <span className="text-sm text-slate-300"><strong>Passive Only:</strong> Never interact with the target (no login attempts, no scanning) without permission.</span>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-950/30 border border-red-500/10">
                    <Scale className="h-5 w-5 text-red-400 mt-0.5" />
                    <span className="text-sm text-slate-300"><strong>Respect Scope:</strong> Only gather data relevant to your defensive objectives.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

// 🟢 REUSABLE CARD COMPONENT
function ToolCard({ icon: Icon, title, desc, points, color, borderColor, index }: any) {
  return (
    <motion.div 
      variants={fade} 
      initial="hidden" 
      animate="visible" 
      custom={index}
      whileHover={{ scale: 1.02, translateY: -5 }} 
      transition={{ duration: 0.2 }}
    >
      <Card className={`h-full border-slate-800 bg-[#0f141f] transition-all duration-300 ${borderColor} hover:bg-[#0B1520] hover:shadow-xl flex flex-col`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-slate-400 mb-6 font-medium border-b border-slate-800 pb-4">
            {desc}
          </p>
          <ul className="space-y-3 mt-auto">
            {points.map((point: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}