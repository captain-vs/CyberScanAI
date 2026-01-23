"use client"

import { useState } from "react"
import { CyberWrapper } from "@/components/cyber-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, GitBranch, ChevronRight, Crosshair, Shield, Lock, ArrowLeft } from "lucide-react"
import { ROADMAP_DATA, TreeNode } from "@/lib/roadmap-data"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"

// --- 🌳 NEW: CYBER VISUALIZATION TREE COMPONENTS ---

// Helper to get colors based on track ID
const getTheme = (id: string) => {
  if (id.includes('red')) return { bg: "bg-red-500/10", border: "border-red-500/50", text: "text-red-400", shadow: "shadow-red-500/20", line: "bg-red-500/40" }
  if (id.includes('blue')) return { bg: "bg-blue-500/10", border: "border-blue-500/50", text: "text-blue-400", shadow: "shadow-blue-500/20", line: "bg-blue-500/40" }
  return { bg: "bg-lime-500/10", border: "border-lime-500/50", text: "text-lime-400", shadow: "shadow-lime-500/20", line: "bg-lime-500/40" }
}

// The actual Node Box
const CyberNode = ({ node, theme }: { node: TreeNode, theme: any }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${theme.shadow.split('-')[1]}` }}
    className={`relative z-20 p-4 rounded-xl border ${theme.border} ${theme.bg} backdrop-blur-md min-w-[180px] max-w-[220px] text-center shadow-lg ${theme.shadow}`}
  >
    {/* Glowing Connectors on the box edges */}
    <div className={`absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${theme.bg.replace('/10','')} shadow-sm`} />
    <div className={`absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${theme.bg.replace('/10','')} shadow-sm`} />
    
    <h4 className={`font-bold ${theme.text} text-sm mb-1`}>{node.label}</h4>
    {node.description && <p className="text-xs text-slate-400 leading-tight">{node.description}</p>}
  </motion.div>
)

// Recursive Branch handling layout and lines
const CyberVisTree = ({ node, rootId, isRoot = false }: { node: TreeNode, rootId: string, isRoot?: boolean }) => {
  const hasChildren = node.children && node.children.length > 0
  const theme = getTheme(rootId)

  return (
    <div className="flex items-center">
        {/* The Node */}
        <CyberNode node={node} theme={theme} />

        {/* If children exist, draw connecting lines and render children */}
        {hasChildren && (
          <>
            {/* Horizontal line from parent to children stack */}
            <div className={`w-12 h-[2px] ${theme.line} relative z-10`}></div>

            {/* Children container */}
            <div className="flex flex-col justify-center relative pl-4">
                {/* Vertical Spine Line connecting all children */}
                {node.children!.length > 1 && (
                   <div className={`absolute left-0 top-6 bottom-6 w-[2px] ${theme.line}`}></div>
                )}
                
                {node.children!.map((child, i) => (
                  <div key={child.id} className="flex items-center relative py-3">
                     {/* Horizontal line to individual child */}
                     <div className={`w-8 h-[2px] ${theme.line} absolute left-[-16px]`}></div>
                     {/* RECURSION: Render child branch */}
                     <CyberVisTree node={child} rootId={rootId} />
                  </div>
                ))}
            </div>
          </>
        )}
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---

export default function RoadmapPage() {
  // Default to Red Team so something is shown initially
  const [activeCareer, setActiveCareer] = useState<string | null>("red-team")

  const activeTreeData = ROADMAP_DATA.careerTrees.find(t => t.id === activeCareer)

  return (
    <AuthGuard>
      <CyberWrapper>
        <div className="container mx-auto px-4 py-12">
          {/* BACK BUTTON */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-lime-400 text-slate-400">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          {/* HEADER */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white">
              Cyber<span className="text-lime-400">Roadmap</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Your master plan. From networking basics to Elite Ops.
            </p>
          </div>

          <Tabs defaultValue="career" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-slate-900 border border-slate-800 p-1">
                <TabsTrigger value="timeline" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black">
                   Timeline View
                </TabsTrigger>
                <TabsTrigger value="career" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
                   Career Paths (Visualized)
                </TabsTrigger>
                <TabsTrigger value="courses" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                   Free Course Database
                </TabsTrigger>
              </TabsList>
            </div>

            {/* =========================================
                1. TIMELINE VIEW (UNCHANGED)
            ========================================= */}
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
                    {/* Glowing Node */}
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

            {/* =========================================
                2. NEW: INTERACTIVE VISUAL CAREER TREES
            ========================================= */}
            <TabsContent value="career" className="w-full">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">Select Your Path</h2>
                <p className="text-slate-400 mb-8">Click a domain to generate its skill tree visualization.</p>

                {/* Top Selection Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {ROADMAP_DATA.careerTrees.map((tree) => {
                     const isActive = activeCareer === tree.id
                     let theme = getTheme(tree.id);
                     let Icon = tree.id.includes('red') ? Crosshair : tree.id.includes('blue') ? Shield : Lock;

                     return (
                       <motion.button
                         key={tree.id}
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => setActiveCareer(tree.id)}
                         className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${
                           isActive 
                             ? `${theme.bg} ${theme.border} ${theme.shadow}` 
                             : "bg-slate-900/50 border-slate-800 hover:bg-slate-900"
                         }`}
                       >
                         <div className={`p-2 rounded-lg ${isActive ? theme.bg : 'bg-slate-800'}`}>
                            <Icon className={`h-6 w-6 ${isActive ? theme.text : 'text-slate-400'}`} />
                         </div>
                         <div className="text-left">
                            <h3 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{tree.label}</h3>
                            <p className="text-xs text-slate-500">{tree.description}</p>
                         </div>
                       </motion.button>
                     )
                  })}
                </div>
              </div>
              
              {/* THE VISUALIZATION AREA */}
              <div className="w-full overflow-x-auto pb-12 bg-[#0a0f18]/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                 <AnimatePresence mode="wait">
                    {activeTreeData && (
                      <motion.div
                        key={activeCareer}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="min-w-max flex justify-center"
                      >
                         {/* Kick off the recursive tree rendering */}
                         <CyberVisTree node={activeTreeData} rootId={activeTreeData.id} isRoot={true} />
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>

            </TabsContent>

            {/* =========================================
                3. FREE COURSES (UNCHANGED)
            ========================================= */}
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