"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Shield, 
  Search, 
  Gamepad2, 
  BookOpen, 
  User, 
  Map, 
  Globe, 
  Terminal, 
  Mail, 
  Fingerprint, 
  Database,
  ArrowRight
} from "lucide-react"

// --- PLATFORM STRUCTURE DATA ---
const platformMap = [
  {
    category: "Core Scanning Engine",
    icon: Shield,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    description: "AI-powered threat detection and analysis tools.",
    links: [
      { name: "URL & Web Scanner", path: "/scan", icon: Globe },
      { name: "File Malware Analysis", path: "/scan", icon: Database },
      { name: "Image Steganography", path: "/scan", icon: Fingerprint },
      { name: "Hash Generator", path: "/scan", icon: Terminal },
    ]
  },
  {
    category: "Advanced OSINT Suite",
    icon: Search,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    description: "Open-source intelligence gathering utilities.",
    links: [
      { name: "OSINT Dashboard", path: "/osint", icon: Search },
      { name: "Dark Web Monitor", path: "/osint/darkweb", icon: Globe },
      { name: "DNS Enumeration", path: "/osint/dns", icon: Database },
      { name: "Email Reconnaissance", path: "/osint/email", icon: Mail },
      { name: "Metadata Extractor", path: "/osint/metadata", icon: Fingerprint },
      { name: "Social Identity Tracker", path: "/osint/social", icon: User },
      { name: "WHOIS Lookup", path: "/osint/whois", icon: Terminal },
    ]
  },
  {
    category: "Training & GameZone",
    icon: Gamepad2,
    color: "text-lime-400",
    bgColor: "bg-lime-500/10",
    description: "Interactive learning, CTF challenges, and leaderboards.",
    links: [
      { name: "GameZone Hub", path: "/gamezone", icon: Gamepad2 },
      { name: "Daily Security Quizzes", path: "/gamezone/quiz", icon: BookOpen },
      { name: "CTF Challenges", path: "/gamezone/challenge", icon: Terminal },
      { name: "Global Leaderboard", path: "/gamezone/leaderboard", icon: TrophyIcon },
    ]
  },
  {
    category: "Education Hub",
    icon: BookOpen,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    description: "Deep-dives, tutorials, and structured learning paths.",
    links: [
      { name: "Learning Center", path: "/learn", icon: BookOpen },
      { name: "Interactive Labs", path: "/learn/lab", icon: Terminal },
      { name: "Threat Articles", path: "/learn/article", icon: Database },
      { name: "Cybersecurity Roadmap", path: "/roadmap", icon: Map },
    ]
  },
  {
    category: "User Portal",
    icon: User,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    description: "Manage your account, progress, and API limits.",
    links: [
      { name: "Command Dashboard", path: "/dashboard", icon: Terminal },
      { name: "Agent Profile", path: "/profile", icon: User },
      { name: "Login & Registration", path: "/auth", icon: Shield },
    ]
  }
]

// Custom Trophy Icon Component (since it was missing from initial import list)
function TrophyIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7c0 6 3 10 6 10s6-4 6-10V2z" />
    </svg>
  )
}

export default function PlatformDirectory() {
  return (
    <div className="min-h-screen bg-black text-slate-200 py-20 relative overflow-hidden font-sans">
      
      {/* Background FX */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Platform <span className="text-blue-500">Directory</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Your complete map of the CyberScan AI ecosystem. Navigate through our scanning tools, OSINT modules, and educational hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platformMap.map((section, index) => (
            <motion.div 
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0b0f17] border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-800/50 bg-slate-900/30 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${section.bgColor} ${section.color}`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{section.category}</h2>
                  <p className="text-sm text-slate-400 leading-snug">{section.description}</p>
                </div>
              </div>
              
              <div className="p-4 flex-1">
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.path}
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors">
                          <link.icon className={`h-4 w-4 ${section.color} opacity-70 group-hover:opacity-100`} />
                          <span className="font-medium text-sm">{link.name}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transform group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}