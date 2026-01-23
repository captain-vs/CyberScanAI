"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe } from "lucide-react"

// Types for our simulated data
type Attack = {
  id: number
  x: number 
  y: number 
  type: string
  origin: string
  target: string
}

const ATTACK_TYPES = ["DDoS", "SQL Injection", "Malware", "Brute Force", "XSS", "Phishing"]
// Adjusted locations slightly to match the new map projection better
const LOCATIONS = [
  { name: "USA", x: 20, y: 35 },
  { name: "China", x: 78, y: 35 },
  { name: "Russia", x: 75, y: 15 },
  { name: "Brazil", x: 32, y: 65 },
  { name: "Germany", x: 51, y: 28 },
  { name: "India", x: 68, y: 45 },
  { name: "Australia", x: 88, y: 75 },
  { name: "UK", x: 46, y: 26 },
  { name: "Japan", x: 92, y: 35 },
  { name: "South Africa", x: 53, y: 78 },
]

export function ThreatMap() {
  const [attacks, setAttacks] = useState<Attack[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs INSIDE the box only
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  // Simulation Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const source = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
      const target = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
      const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]

      if (source.name === target.name) return

      const newAttack: Attack = {
        id: Date.now(),
        x: target.x + (Math.random() * 4 - 2), // Slight jitter
        y: target.y + (Math.random() * 4 - 2),
        type,
        origin: source.name,
        target: target.name,
      }

      setAttacks((prev) => [...prev, newAttack].slice(-15))
      
      const logMessage = `[${new Date().toLocaleTimeString()}] ${type} detected: ${source.name} ➔ ${target.name}`
      setLogs((prev) => [...prev, logMessage].slice(-6)) 
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0f18] p-4 shadow-2xl relative overflow-hidden h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-lime-400 animate-pulse" />
          <h3 className="font-bold text-white tracking-wide text-sm">GLOBAL THREAT INTERCEPT</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-red-400 font-mono">LIVE FEED</span>
        </div>
      </div>

      {/* MAP CONTAINER */}
      {/* Made background slightly darker to contrast with the new brighter map */}
      <div className="relative aspect-[16/9] w-full bg-[#090e1a] rounded-lg border border-slate-700/50 overflow-hidden">
        
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* ⚡ FIX: NEW VISIBLE WORLD MAP SILHOUETTE */}
        <svg viewBox="0 0 100 50" className="absolute inset-0 h-full w-full pointer-events-none">
          <path 
            // A better low-poly world map path
            d="M26.5,11.5 L31,9 L38,11.5 L42,9 L48,12 L53,10 L58,12 L63,9 L70,11 L76,9 L82,12 L86,16 L91,14 L95,18 L92,24 L96,30 L93,38 L88,34 L82,38 L78,34 L72,37 L68,32 L62,36 L58,32 L52,35 L46,30 L40,34 L32,30 L24,35 L18,30 L12,33 L8,26 L14,20 L10,15 L16,12 L22,16 Z M78,60 L82,65 L88,62 L92,68 L85,75 L78,72 L72,76 L65,70 L70,64 Z M35,55 L40,60 L45,58 L50,65 L45,72 L38,70 L32,75 L25,68 L30,62 Z"
            // Lighter fill with transparency
            fill="rgba(100, 116, 139, 0.25)" 
            // Brighter cyan/blue outline to make it pop
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="0.3"
          />
          {/* Equator Line for cool effect */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.1" strokeDasharray="1 1" />
        </svg>

        {/* ANIMATED ATTACKS (Red Dots & Rings) */}
        <AnimatePresence>
          {attacks.map((attack) => (
            <motion.div
              key={attack.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.5, 2.5], opacity: [1, 0.5, 0] }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{ left: `${attack.x}%`, top: `${attack.y}%` }}
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] z-20" />
              <div className="absolute inset-0 rounded-full border border-red-500/80 z-10" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* CONNECTING LINES (Laser Beams) */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
          <AnimatePresence>
            {attacks.map((attack) => {
               const originObj = LOCATIONS.find(l => l.name === attack.origin)
               if(!originObj) return null
               return (
                 <motion.path
                   key={`line-${attack.id}`}
                   initial={{ pathLength: 0, opacity: 0.6 }}
                   animate={{ pathLength: 1, opacity: 0.1 }}
                   transition={{ duration: 1.8, ease: "circOut" }}
                   d={`M ${originObj.x} ${originObj.y} L ${attack.x} ${attack.y}`}
                   fill="none"
                   stroke="url(#gradient-line)"
                   strokeWidth="0.4"
                   strokeLinecap="round"
                 />
               )
            })}
          </AnimatePresence>
          <defs>
            <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

      </div>

      {/* LIVE LOGS */}
      <div 
        ref={logContainerRef}
        className="mt-4 h-32 overflow-y-auto rounded bg-black/40 p-2 font-mono text-xs border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700"
      >
        <div className="space-y-1">
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2 text-slate-300 border-l-2 border-slate-700 pl-2 truncated"
            >
              <span className="text-lime-500">➜</span>
              {log}
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  )
}