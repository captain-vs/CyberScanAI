"use client"

import { useState, useRef, useEffect } from "react"
import { CyberWrapper } from "@/components/cyber-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, ArrowLeft, Layers, FileBadge, CheckCircle2 } from "lucide-react"
import { ROADMAP_DATA } from "@/lib/roadmap-data"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"

// --- DATA: CAREER PATHWAYS (ROLES) ---
const ROLE_NODES = {
  feeder: [
    { id: "feed-1", label: "Financial Analysis" },
    { id: "feed-2", label: "IT Support" },
    { id: "feed-3", label: "Networking" },
    { id: "feed-4", label: "Security Intel" },
    { id: "feed-5", label: "Software Dev" },
    { id: "feed-6", label: "Systems Engineering" }
  ],
  entry: [
    { id: "entry-1", label: "Cybersecurity Specialist" },
    { id: "entry-2", label: "Cyber Crime Analyst" },
    { id: "entry-3", label: "Incident & Intrusion Analyst" },
    { id: "entry-4", label: "IT Auditor" },
  ],
  mid: [
    { id: "mid-1", label: "Cybersecurity Analyst" },
    { id: "mid-2", label: "Cybersecurity Consultant" },
    { id: "mid-3", label: "Penetration & Vulnerability Tester" },
  ],
  advanced: [
    { id: "adv-1", label: "Cybersecurity Manager" },
    { id: "adv-2", label: "Cybersecurity Engineer" },
    { id: "adv-3", label: "Cybersecurity Architect" },
  ]
}

const ROLE_CONNECTIONS = [
  // Feeder -> Entry
  { from: "feed-2", to: "entry-1" },
  { from: "feed-2", to: "entry-3" },
  { from: "feed-3", to: "entry-1" },
  { from: "feed-3", to: "entry-3" },
  { from: "feed-4", to: "entry-2" },
  { from: "feed-1", to: "entry-4" },
  { from: "feed-5", to: "entry-1" },
  { from: "feed-6", to: "entry-1" },
  { from: "feed-6", to: "mid-2" }, // Systems Eng -> Consultant

  // Entry -> Mid
  { from: "entry-1", to: "mid-1" },
  { from: "entry-1", to: "mid-2" },
  { from: "entry-3", to: "mid-1" },
  { from: "entry-3", to: "mid-3" },
  { from: "entry-2", to: "mid-1" },
  { from: "entry-4", to: "mid-2" },

  // Mid -> Advanced
  { from: "mid-1", to: "adv-2" },
  { from: "mid-1", to: "adv-1" },
  { from: "mid-2", to: "adv-1" },
  { from: "mid-2", to: "adv-3" },
  { from: "mid-3", to: "adv-2" },
  { from: "mid-3", to: "mid-2" }, // Pentester -> Consultant
]

// --- DATA: SKILLS & CERTIFICATIONS ---
// Updated with Full Names and expanded Job Titles based on your image
const CERT_NODES = [
  { id: "cert-1", label: "Certified Information Systems Security Professional (CISSP)" },
  { id: "cert-2", label: "Certified Information Systems Auditor (CISA)" },
  { id: "cert-3", label: "Certified Information Privacy Professional (CIPP)" },
  { id: "cert-4", label: "Certified Information Security Manager (CISM)" },
  { id: "cert-5", label: "Global Information Assurance Certification (GIAC)" },
  { id: "cert-6", label: "CompTIA Security+ Certification" },
]

const JOB_NODES = [
  { id: "job-eng", label: "Cybersecurity Engineer" },
  { id: "job-mgr", label: "Cybersecurity Manager" },
  { id: "job-ana", label: "Cybersecurity Analyst" },
  { id: "job-aud", label: "IT Auditor" },
  { id: "job-spec", label: "Cybersecurity Specialist" },
  { id: "job-inc", label: "Incident & Intrusion Analyst" },
  { id: "job-arch", label: "Cybersecurity Architect" },
  { id: "job-cons", label: "Cybersecurity Consultant" },
  { id: "job-pen", label: "Penetration & Vulnerability Tester" },
  { id: "job-crime", label: "Cyber Crime Analyst" }
]

const SKILL_NODES = [
  { id: "skill-1", label: "Information Security / Assurance" },
  { id: "skill-2", label: "Security Operations" },
  { id: "skill-3", label: "Cryptography" },
  { id: "skill-4", label: "Risk Assessment and Management" },
  { id: "skill-5", label: "Threat Analysis" },
  { id: "skill-6", label: "Authentication" },
  { id: "skill-7", label: "Network Security" },
  { id: "skill-8", label: "NIST Cybersecurity Framework" },
  { id: "skill-9", label: "Internal Auditing" },
]

const SKILL_CONNECTIONS = [
  // --- CERT -> JOB CONNECTIONS ---
  // CISSP (The big one - connects to almost everything senior)
  { from: "cert-1", to: "job-mgr" },
  { from: "cert-1", to: "job-eng" },
  { from: "cert-1", to: "job-arch" },
  { from: "cert-1", to: "job-cons" },
  { from: "cert-1", to: "job-ana" },

  // CISA (Auditing focus)
  { from: "cert-2", to: "job-aud" },
  { from: "cert-2", to: "job-cons" },
  { from: "cert-2", to: "job-mgr" },

  // CIPP (Privacy focus - connects to Audit, Consultant, Manager)
  { from: "cert-3", to: "job-cons" },
  { from: "cert-3", to: "job-aud" },
  { from: "cert-3", to: "job-mgr" },
  { from: "cert-3", to: "job-spec" }, // Policy specialist

  // CISM (Management focus)
  { from: "cert-4", to: "job-mgr" },
  { from: "cert-4", to: "job-cons" },
  { from: "cert-4", to: "job-arch" },

  // GIAC (Technical depth)
  { from: "cert-5", to: "job-eng" },
  { from: "cert-5", to: "job-inc" },
  { from: "cert-5", to: "job-pen" },
  { from: "cert-5", to: "job-ana" },

  // Security+ (Entry level / General)
  { from: "cert-6", to: "job-spec" },
  { from: "cert-6", to: "job-ana" },
  { from: "cert-6", to: "job-inc" },
  { from: "cert-6", to: "job-pen" },
  { from: "cert-6", to: "job-eng" }, // Junior engineer
  { from: "cert-6", to: "job-crime" },

  // --- JOB -> SKILL CONNECTIONS ---
  // Engineer
  { from: "job-eng", to: "skill-1" },
  { from: "job-eng", to: "skill-7" }, // Network Sec
  { from: "job-eng", to: "skill-6" }, // Auth
  { from: "job-eng", to: "skill-3" }, // Crypto

  // Manager
  { from: "job-mgr", to: "skill-1" },
  { from: "job-mgr", to: "skill-4" }, // Risk
  { from: "job-mgr", to: "skill-8" }, // NIST
  { from: "job-mgr", to: "skill-2" }, // Sec Ops

  // Analyst
  { from: "job-ana", to: "skill-2" }, // Sec Ops
  { from: "job-ana", to: "skill-5" }, // Threat
  { from: "job-ana", to: "skill-1" },

  // Auditor
  { from: "job-aud", to: "skill-9" }, // Auditing
  { from: "job-aud", to: "skill-4" }, // Risk
  { from: "job-aud", to: "skill-8" }, // NIST

  // Incident
  { from: "job-inc", to: "skill-5" }, // Threat
  { from: "job-inc", to: "skill-2" }, // Sec Ops

  // Architect
  { from: "job-arch", to: "skill-7" }, // Net Sec
  { from: "job-arch", to: "skill-6" }, // Auth
  { from: "job-arch", to: "skill-8" }, // NIST
  { from: "job-arch", to: "skill-3" }, // Crypto

  // Consultant
  { from: "job-cons", to: "skill-4" }, // Risk
  { from: "job-cons", to: "skill-8" }, // NIST
  { from: "job-cons", to: "skill-1" }, 

  // Pentester
  { from: "job-pen", to: "skill-7" }, // Net Sec
  { from: "job-pen", to: "skill-6" }, // Auth
  { from: "job-pen", to: "skill-3" }, // Crypto

  // Crime Analyst
  { from: "job-crime", to: "skill-5" }, // Threat
  { from: "job-crime", to: "skill-1" },
]


// --- COMPONENT: SVG CONNECTORS ---
// Draws curved lines between elements with INTELLIGENT HIGHLIGHTING
const ConnectionsOverlay = ({ 
  connections, 
  nodes, 
  highlightId, 
  isHoverMode = false 
}: { 
  connections: { from: string, to: string }[], 
  nodes: any[], 
  highlightId: string | null,
  isHoverMode?: boolean
}) => {
  const [paths, setPaths] = useState<{ id: string, d: string, active: boolean }[]>([])

  useEffect(() => {
    const updatePaths = () => {
      const newPaths = connections.map((conn, idx) => {
        const fromEl = document.getElementById(conn.from)
        const toEl = document.getElementById(conn.to)
        
        if (!fromEl || !toEl) return null

        const fromRect = fromEl.getBoundingClientRect()
        const toRect = toEl.getBoundingClientRect()
        const containerRect = document.getElementById("diagram-container")?.getBoundingClientRect() || { top: 0, left: 0 }

        // Calculate relative coordinates
        const startX = fromRect.right - containerRect.left
        const startY = fromRect.top + fromRect.height / 2 - containerRect.top
        const endX = toRect.left - containerRect.left
        const endY = toRect.top + toRect.height / 2 - containerRect.top

        // Bezier Curve Logic
        const controlPoint1X = startX + (endX - startX) * 0.5
        const controlPoint2X = endX - (endX - startX) * 0.5

        const d = `M ${startX} ${startY} C ${controlPoint1X} ${startY}, ${controlPoint2X} ${endY}, ${endX} ${endY}`
        
        // --- INTELLIGENT HIGHLIGHT LOGIC ---
        let isActive = false
        if (highlightId) {
            if (isHoverMode) {
                // Logic for Skills & Certs View:
                // 1. Direct Connection: Is this line connected directly to the clicked node?
                const isDirect = conn.from === highlightId || conn.to === highlightId;
                
                // 2. Chain Connection: 
                //    If I click Cert -> Highlight Cert-Job AND Job-Skill
                //    If I click Job -> Highlight Cert-Job AND Job-Skill
                //    If I click Skill -> Highlight Job-Skill AND Cert-Job

                if (isDirect) {
                    isActive = true;
                } else {
                    // Check for secondary connections
                    // Scenario A: HighlightId is Cert. This conn is Job->Skill. Is Job connected to HighlightId?
                    const parentConn = connections.find(c => c.from === highlightId && c.to === conn.from);
                    if (parentConn) isActive = true;

                    // Scenario B: HighlightId is Skill. This conn is Cert->Job. Is Job connected to HighlightId?
                    const childConn = connections.find(c => c.from === conn.to && c.to === highlightId);
                    if (childConn) isActive = true;
                }

            } else {
                 // Logic for Roles View (Simpler chain)
                 if (conn.from === highlightId || conn.to === highlightId) isActive = true
            }
        }

        return { id: `${conn.from}-${conn.to}`, d, active: isActive }
      }).filter(Boolean) as { id: string, d: string, active: boolean }[]

      setPaths(newPaths)
    }

    // Run initially and on resize
    updatePaths()
    window.addEventListener('resize', updatePaths)
    const t = setTimeout(updatePaths, 100)
    return () => {
        window.removeEventListener('resize', updatePaths)
        clearTimeout(t)
    }
  }, [connections, highlightId, isHoverMode])

  return (
    <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          fill="none"
          stroke={path.active ? "#a3e635" : "#334155"} // Lime vs Slate-700
          strokeWidth={path.active ? 2 : 1}
          strokeOpacity={path.active ? 1 : 0.2}
          className="transition-all duration-300"
        />
      ))}
    </svg>
  )
}


export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState("career")
  const [vizMode, setVizMode] = useState<"roles" | "skills">("roles")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  return (
    <AuthGuard>
      <CyberWrapper>
        <div className="container mx-auto px-4 py-12">
          
          {/* TOP NAV */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-lime-400 text-slate-400">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white">
              Cyber<span className="text-lime-400">Roadmap</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Visualizing the Cyber Workforce. Track your path from certification to specialization.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-slate-900 border border-slate-800 p-1">
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="career">Career Pathway</TabsTrigger>
                <TabsTrigger value="courses">Free Courses</TabsTrigger>
              </TabsList>
            </div>

            {/* =======================
                TIMELINE VIEW (Unchanged)
               ======================= */}
            <TabsContent value="timeline" className="max-w-4xl mx-auto">
              <div className="relative border-l-2 border-slate-800 ml-4 md:ml-0 md:pl-0 space-y-16 py-12">
                {ROADMAP_DATA.timeline.map((phase, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative md:ml-12 pl-8 md:pl-0"
                  >
                    <div className="absolute left-[-5px] md:left-[-6px] top-0 h-3 w-3 rounded-full bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)] z-10" />
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-white mb-2">{phase.phase}</h2>
                        <p className="text-lg text-slate-400 border-l-4 border-lime-500/30 pl-4 italic">
                          {phase.desc}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {phase.steps.map((step, j) => (
                        <motion.div 
                          key={j} 
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl hover:bg-slate-800/60 hover:border-lime-500/30 transition-all group"
                        >
                          <div className="p-3 rounded-lg bg-slate-950 w-fit mb-3 group-hover:text-lime-400 transition-colors">
                            <step.icon className="h-6 w-6" />
                          </div>
                          <h4 className="font-bold text-slate-200 mb-1">{step.title}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* =======================
                INTERACTIVE MAP
               ======================= */}
            <TabsContent value="career" className="w-full">
              
              {/* Toggle Switch */}
              <div className="flex justify-center mb-8">
                <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex gap-2">
                    <button 
                        onClick={() => { setVizMode("roles"); setSelectedNode(null); }}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${vizMode === 'roles' ? 'bg-lime-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Layers className="h-4 w-4" /> Workforce Roles Map
                    </button>
                    <button 
                        onClick={() => { setVizMode("skills"); setSelectedNode(null); }}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${vizMode === 'skills' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <FileBadge className="h-4 w-4" /> Skills & Certifications
                    </button>
                </div>
              </div>

              {/* VISUALIZATION CONTAINER */}
              <div className="relative w-full overflow-x-auto bg-[#0a0f18] border border-slate-800 rounded-2xl p-8 min-h-[700px] shadow-2xl">
                <div id="diagram-container" className="relative min-w-[1100px] h-full">
                    
                    {/* --- MODE 1: WORKFORCE ROLES --- */}
                    {vizMode === "roles" && (
                        <>
                            <ConnectionsOverlay 
                                connections={ROLE_CONNECTIONS} 
                                nodes={Object.values(ROLE_NODES).flat()} 
                                highlightId={selectedNode}
                            />

                            <div className="grid grid-cols-4 gap-12 relative z-10">
                                {/* Column 1: Feeder */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-slate-500 border-b border-slate-700 pb-2 mb-6">Feeder Roles</h3>
                                    {ROLE_NODES.feeder.map(node => (
                                        <div 
                                            key={node.id} id={node.id}
                                            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                                            className={`p-3 rounded-lg border text-sm cursor-pointer transition-all ${selectedNode === node.id ? 'bg-lime-500/20 border-lime-500 text-white shadow-[0_0_15px_rgba(132,204,22,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                        >
                                            {node.label}
                                        </div>
                                    ))}
                                </div>

                                {/* Column 2: Starting */}
                                <div className="space-y-12 mt-12">
                                    <h3 className="text-lg font-bold text-blue-400 border-b border-blue-500/30 pb-2 mb-6">Starting-Level</h3>
                                    {ROLE_NODES.entry.map(node => (
                                        <div 
                                            key={node.id} id={node.id}
                                            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                                            className={`p-4 rounded-xl border text-center font-semibold cursor-pointer transition-all relative ${selectedNode === node.id ? 'bg-blue-500/20 border-blue-400 text-white scale-105' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500/50'}`}
                                        >
                                            {node.label}
                                            <div className="flex justify-center gap-1 mt-2 opacity-50">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Column 3: Mid */}
                                <div className="space-y-12 mt-6">
                                    <h3 className="text-lg font-bold text-purple-400 border-b border-purple-500/30 pb-2 mb-6">Mid-Level</h3>
                                    {ROLE_NODES.mid.map(node => (
                                        <div 
                                            key={node.id} id={node.id}
                                            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                                            className={`p-4 rounded-xl border text-center font-semibold cursor-pointer transition-all relative ${selectedNode === node.id ? 'bg-purple-500/20 border-purple-400 text-white scale-105' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-purple-500/50'}`}
                                        >
                                            {node.label}
                                            <div className="flex justify-center gap-1 mt-2 opacity-50">
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                                                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                                                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Column 4: Advanced */}
                                <div className="space-y-12">
                                    <h3 className="text-lg font-bold text-lime-400 border-b border-lime-500/30 pb-2 mb-6">Advanced-Level</h3>
                                    {ROLE_NODES.advanced.map(node => (
                                        <div 
                                            key={node.id} id={node.id}
                                            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                                            className={`p-4 rounded-xl border text-center font-semibold cursor-pointer transition-all relative ${selectedNode === node.id ? 'bg-lime-500/20 border-lime-400 text-white scale-105' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-lime-500/50'}`}
                                        >
                                            {node.label}
                                            <div className="flex justify-center gap-1 mt-2 opacity-50">
                                                <div className="h-1.5 w-1.5 rounded-full bg-lime-500"></div>
                                                <div className="h-1.5 w-1.5 rounded-full bg-lime-500"></div>
                                                <div className="h-1.5 w-1.5 rounded-full bg-lime-500"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- MODE 2: SKILLS & CERTS --- */}
                    {vizMode === "skills" && (
                        <>
                            <ConnectionsOverlay 
                                connections={SKILL_CONNECTIONS} 
                                nodes={[...CERT_NODES, ...JOB_NODES, ...SKILL_NODES]} 
                                highlightId={selectedNode}
                                isHoverMode={true}
                            />

                            <div className="grid grid-cols-3 gap-20 relative z-10 items-stretch">
                                {/* Col 1: Certifications */}
                                <div className="space-y-6">
                                    <h3 className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs mb-8 border-b border-slate-800 pb-2">Top Certification</h3>
                                    {CERT_NODES.map(node => (
                                        <div 
                                            key={node.id} id={node.id}
                                            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                                            className={`p-4 text-right pr-4 border-r-2 cursor-pointer transition-all ${selectedNode === node.id ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-950/20' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                                        >
                                            {node.label}
                                        </div>
                                    ))}
                                </div>

                                {/* Col 2: Job Titles (Center) */}
                                <div className="space-y-4 pt-10">
                                    <h3 className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs mb-8 border-b border-slate-800 pb-2">Job Title</h3>
                                    {JOB_NODES.map(node => {
                                        // Is this job actively connected?
                                        let isActive = false;
                                        if (selectedNode) {
                                            // Case 1: Job itself selected
                                            if (selectedNode === node.id) isActive = true;
                                            // Case 2: Cert selected -> Job connected?
                                            else if (SKILL_CONNECTIONS.some(c => c.from === selectedNode && c.to === node.id)) isActive = true;
                                            // Case 3: Skill selected -> Job connected?
                                            else if (SKILL_CONNECTIONS.some(c => c.from === node.id && c.to === selectedNode)) isActive = true;
                                        }

                                        return (
                                            <div 
                                                key={node.id} id={node.id}
                                                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                                                className={`p-2 text-center rounded transition-all cursor-pointer border ${isActive || selectedNode === node.id ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-slate-500 border-transparent hover:text-white'}`}
                                            >
                                                {node.label}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Col 3: Top Skills */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs mb-8 border-b border-slate-800 pb-2">Top Skills</h3>
                                    {SKILL_NODES.map(node => {
                                        // Highlight logic for skill
                                        let isActive = false;
                                        if (selectedNode) {
                                            // Case 1: Skill itself selected
                                            if (selectedNode === node.id) isActive = true;
                                            // Case 2: Job selected -> Skill connected?
                                            else if (SKILL_CONNECTIONS.some(c => c.from === selectedNode && c.to === node.id)) isActive = true;
                                            // Case 3: Cert selected -> Job -> Skill?
                                            else {
                                                // Find if any job connected to this skill is connected to the selected cert
                                                isActive = SKILL_CONNECTIONS.some(cJobSkill => 
                                                    cJobSkill.to === node.id && // This connection is Job->Skill
                                                    SKILL_CONNECTIONS.some(cCertJob => cCertJob.from === selectedNode && cCertJob.to === cJobSkill.from) // Cert->Job matches
                                                );
                                            }
                                        }

                                        return (
                                            <div 
                                                key={node.id} id={node.id}
                                                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                                                className={`p-3 text-left pl-4 border-l-2 cursor-pointer transition-all ${isActive || selectedNode === node.id ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-950/20' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                                            >
                                                {node.label}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                </div>
              </div>

            </TabsContent>

            {/* =======================
                FREE COURSES (Unchanged)
               ======================= */}
            <TabsContent value="courses">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ROADMAP_DATA.courses.map((course, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline" className="border-slate-700 text-slate-400">{course.type}</Badge>
                          <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
                            {course.icon === 'ecc' ? 'EC' : course.icon === 'tcm' ? 'TC' : course.icon === 'iso' ? 'ISO' : course.icon.substring(0,2)}
                          </div>
                      </div>
                      
                      <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription>{course.provider}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                      <Button asChild className="w-full bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 transition-all">
                        <Link href={course.link} target="_blank">
                          Start Learning <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </CyberWrapper>
    </AuthGuard>
  )
}
