"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Terminal, Shield, CheckCircle2, Globe, Server, Wifi, User, Cpu, Lock } from "lucide-react" // Added missing icons
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion" // ✅ ADDED AnimatePresence HERE
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// --- LESSON DATA ---
const lessons = [
  {
    id: 0,
    title: "Welcome Operative",
    icon: Shield,
    content: "This black screen is a 'Terminal'. Hackers don't use a mouse; they type commands for speed and control.\n\nYour first job is to see what this computer can do.",
    task: "Type 'help' and hit Enter.",
    validCommands: ["help"]
  },
  {
    id: 1,
    title: "Who Are You?",
    icon: User,
    content: "In Linux, every user has a name. The 'root' user is the Administrator (God Mode). Regular users have limits.",
    task: "Type 'whoami' to identify yourself.",
    validCommands: ["whoami"]
  },
  {
    id: 2,
    title: "Your Digital Address (IP)",
    icon: Globe,
    content: "Every computer on the internet has an IP Address (e.g., 192.168.1.5). Think of it like your home address.",
    task: "Type 'ip addr' to find your address.",
    validCommands: ["ip addr", "ifconfig"]
  },
  {
    id: 3,
    title: "Open Doors (Ports)",
    icon: Server,
    content: "An IP address finds the house. A 'Port' finds the room. \n\nPort 80 = Web Page\nPort 22 = SSH\n\nWe need to see which doors are open.",
    task: "Type 'netstat' to scan ports.",
    validCommands: ["netstat", "netstat -an"]
  },
  {
    id: 4,
    title: "Check Connection (Ping)",
    icon: Wifi,
    content: "Before we hack, we check if the target is online. 'Ping' sends a signal and waits for an echo.",
    task: "Type 'ping google.com' to test connection.",
    validCommands: ["ping", "ping google.com"]
  },
  {
    id: 5,
    title: "Secure Uplink",
    icon: Lock,
    content: "You have verified your Identity, IP, Ports, and Connection. You are ready to join the network.",
    task: "Type 'connect' to finish training.",
    validCommands: ["connect"]
  }
]

// --- THEORY DATA (New Section) ---
const theoryModules = [
  {
    title: "The Linux Terminal",
    icon: Terminal,
    desc: "The CLI (Command Line Interface) is the most powerful tool in cybersecurity. Unlike a GUI (Graphical User Interface), it allows direct communication with the OS kernel, enabling automation and deep system access."
  },
  {
    title: "IP Addressing (IPv4)",
    icon: Globe,
    desc: "An IP address (e.g., 192.168.1.1) is a unique identifier for a device on a network. 'Local' IPs identify devices in your home/office, while 'Public' IPs identify you to the entire internet."
  },
  {
    title: "Ports & Protocols",
    icon: Server,
    desc: "Ports are virtual docking stations. There are 65,535 available ports. Hackers scan these to find 'open doors' (vulnerabilities). Common ports: HTTP (80), HTTPS (443), SSH (22), FTP (21)."
  },
  {
    title: "The Ping Command",
    icon: Wifi,
    desc: "Ping uses ICMP (Internet Control Message Protocol) to measure 'latency'—the time it takes data to travel. If a server replies, it's alive. If it doesn't, it might be offline or blocked by a firewall."
  }
]

export default function ModuleZero() {
  const [input, setInput] = useState("")
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "CYBER_OS v1.0.4 [Verified]",
    "System Initialized...",
    "Waiting for user input...",
  ])
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // ✅ SCROLL FIX: Reference to the inner scrollable div
  const terminalViewportRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logic (Internal Only)
  useEffect(() => {
    if (terminalViewportRef.current) {
      terminalViewportRef.current.scrollTop = terminalViewportRef.current.scrollHeight
    }
  }, [terminalHistory])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.trim().toLowerCase()
    
    // Add command to history
    let newHistory = [...terminalHistory, `root@kali:~$ ${input}`]

    if (cmd === "clear") {
      setTerminalHistory([])
      setInput("")
      return
    }

    // Check Command
    const activeLesson = lessons[currentLessonIndex]
    const isValid = activeLesson.validCommands.some(valid => cmd.startsWith(valid))

    if (isValid) {
      // Success Responses
      if (currentLessonIndex === 0) newHistory.push("COMMANDS: help, whoami, ip addr, netstat, ping, connect")
      if (currentLessonIndex === 1) newHistory.push("root")
      if (currentLessonIndex === 2) newHistory.push("inet 192.168.1.55/24 brd 192.168.1.255 scope global dynamic")
      if (currentLessonIndex === 3) newHistory.push("tcp  0  0 0.0.0.0:80  0.0.0.0:* LISTEN", "tcp  0  0 0.0.0.0:22  0.0.0.0:* LISTEN")
      if (currentLessonIndex === 4) newHistory.push("64 bytes from 142.250.1.1: icmp_seq=1 ttl=117 time=14.2 ms")
      
      if (currentLessonIndex === 5) {
        newHistory.push("Connecting to HQ...", "Access Granted.", "Welcome to the team, Operative.")
        setIsComplete(true)
      } else {
        setTimeout(() => setCurrentLessonIndex(prev => prev + 1), 500)
      }
    } else {
      if (cmd === "help") {
         newHistory.push("Hint: Read the mission objective on the left.")
      } else {
         newHistory.push(`bash: ${cmd}: command not found`)
      }
    }

    setTerminalHistory(newHistory)
    setInput("")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-lime-500/30 pb-20">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lime-400">
            <Terminal className="h-5 w-5" />
            <span className="font-bold tracking-widest">MODULE 0: BASICS</span>
          </div>
          <Button variant="ghost" size="sm" asChild className="hover:text-white">
            <Link href="/learn"><ArrowLeft className="mr-2 h-4 w-4" /> Exit Lab</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* --- LAB INTERFACE (Fixed Height to prevent Page Jump) --- */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          
          {/* LEFT PANEL: INSTRUCTIONS */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 border-l-4 border-l-lime-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-lime-400" /> 
                  Mission Briefing
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm leading-relaxed">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLessonIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <p className="whitespace-pre-line mb-4">{lessons[currentLessonIndex].content}</p>
                    {!isComplete && (
                      <div className="bg-black/40 p-3 rounded border border-slate-700">
                        <p className="text-xs text-lime-500 font-bold uppercase mb-1">Current Objective:</p>
                        <code className="text-white font-mono text-sm">{lessons[currentLessonIndex].task}</code>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Progress Steps */}
            <div className="hidden lg:block space-y-2">
              {lessons.map((lesson, index) => (
                <div key={index} className={`flex items-center gap-3 p-2 rounded transition-colors ${index === currentLessonIndex ? "bg-slate-800" : "opacity-50"}`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${index < currentLessonIndex ? "bg-lime-500 text-black" : index === currentLessonIndex ? "bg-white text-black" : "bg-slate-700 text-slate-400"}`}>
                    {index < currentLessonIndex ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="text-sm font-medium">{lesson.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: TERMINAL (Fixed Height) */}
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl flex flex-col h-[500px]"> {/* 👈 FIXED HEIGHT */}
              
              {/* Terminal Header */}
              <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/50" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                  <div className="h-3 w-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-4 text-xs text-slate-500 font-mono">root@cyberscan-lab:~</div>
              </div>

              {/* Terminal Output (Internal Scroll) */}
              <div 
                ref={terminalViewportRef}
                className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
              >
                {terminalHistory.map((line, i) => (
                  <div key={i} className={`${line.startsWith("root@") ? "text-lime-400 pt-2 font-bold" : "text-slate-300"}`}>
                    {line}
                  </div>
                ))}
              </div>

              {/* Input Area (Pinned to bottom of box) */}
              <div className="p-3 bg-slate-900/50 border-t border-slate-800 shrink-0">
                <form onSubmit={handleCommand} className="flex items-center gap-2">
                  <span className="text-lime-500 font-bold whitespace-nowrap">root@kali:~$</span>
                  <input
                    autoFocus
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-slate-600"
                    placeholder={isComplete ? "Session Closed" : "Type command..."}
                    disabled={isComplete}
                    autoComplete="off"
                  />
                </form>
              </div>
            </div>

            {isComplete && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-lime-500/10 border border-lime-500/30 rounded-lg flex items-center justify-between">
                 <div>
                   <h3 className="text-lime-400 font-bold">Module Complete!</h3>
                   <p className="text-slate-400 text-sm">You have mastered the basics.</p>
                 </div>
                 <Button className="bg-lime-500 text-black hover:bg-lime-400" asChild>
                   <Link href="/learn">Return to Hub</Link>
                 </Button>
               </motion.div>
            )}
          </div>
        </div>

        {/* --- DEEP DIVE SECTION (What you requested) --- */}
        <div className="border-t border-slate-800 pt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Knowledge Base</h2>
            <p className="text-slate-400">Understanding the technology behind the commands.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {theoryModules.map((module, i) => (
              <Card key={i} className="bg-slate-900/30 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white text-lg">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <module.icon className="h-5 w-5" />
                    </div>
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {module.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-slate-900 to-black border border-slate-800">
             <div className="flex items-start gap-4">
                <Cpu className="h-8 w-8 text-purple-500 shrink-0" />
                <div>
                   <h3 className="text-white font-bold text-lg mb-2">Why learn the Terminal?</h3>
                   <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      Cybersecurity professionals live in the terminal. Graphical interfaces (GUIs) hide details to make things "easy," but hackers need to see the raw data. 
                      By learning these commands, you are learning to speak the computer's native language.
                   </p>
                   <Badge variant="outline" className="text-purple-400 border-purple-500/30">Next Step: File Systems</Badge>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}