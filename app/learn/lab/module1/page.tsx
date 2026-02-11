"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
// ✅ FIX 1: Added 'Clock' to the imports below
import { Terminal, ShieldAlert, Cpu, Keyboard, Power, X, CheckCircle2, XCircle, Heart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AuthGuard from "@/components/auth-guard"
import { useRouter } from "next/navigation" 
import { recordActivity } from "@/lib/activity"

// --- COMMAND DATA ---
const COMMAND_POOL = [
  { 
    cmd: "ls", 
    desc: "Lists all files and directories within the current folder context.\nUsing flags like '-a' reveals hidden configuration files, while '-l' provides detailed permissions." 
  },
  { 
    cmd: "cd", 
    desc: "Changes the shell's current working directory to a specific path.\nYou can navigate using relative paths like '..' to go up one level." 
  },
  { 
    cmd: "pwd", 
    desc: "Prints the absolute path of the current working directory.\nCrucial during scripting to verify exactly where you are in the filesystem." 
  },
  { 
    cmd: "whoami", 
    desc: "Displays the username of the current user invoking the command.\nSecurity scripts use this to verify if the shell has 'root' privileges." 
  },
  { 
    cmd: "clear", 
    desc: "Clears all visible text from the terminal screen.\nNote: This usually just scrolls previous output out of view; history remains accessible." 
  },
  { 
    cmd: "mkdir", 
    desc: "Creates a new directory (folder) at the specified path.\nUse the '-p' flag to create complex nested directory structures instantly." 
  },
  { 
    cmd: "touch", 
    desc: "Updates a file's timestamp or creates an empty file if it doesn't exist.\nCommonly used to create placeholder files for testing." 
  },
  { 
    cmd: "rm -rf", 
    desc: "Recursively and forcefully removes files/directories.\nWARNING: Deleted files bypass the trash bin and are often unrecoverable." 
  },
  { 
    cmd: "cp file", 
    desc: "Copies a source file or directory to a new destination.\nCreates an exact duplicate while keeping the original intact." 
  },
  { 
    cmd: "mv data", 
    desc: "Moves a file to a new directory or renames it.\nUnlike copying, this removes the file from its original location." 
  },
  { 
    cmd: "cat log", 
    desc: "Outputs a file's entire content to the terminal.\nBest for short files; large files can flood the screen without a pager like 'less'." 
  },
  { 
    cmd: "sudo apt", 
    desc: "Runs a command with Superuser (Root) privileges.\nRequired for installing, updating, or removing system packages." 
  },
  { 
    cmd: "ping 8.8.8.8", 
    desc: "Sends ICMP packets to test connectivity to an IP or domain.\nMeasures the round-trip time to ensure the network path is active." 
  },
  { 
    cmd: "chmod +x", 
    desc: "Adds the 'executable' permission to a file.\nNecessary to run a script directly from the shell using './filename'." 
  },
  { 
    cmd: "ps aux", 
    desc: "Displays a snapshot of all running processes.\nShows Process ID (PID), CPU/Memory usage, and the user owner." 
  },
  { 
    cmd: "grep error", 
    desc: "Searches text data for lines matching a pattern.\nExtremely powerful for filtering massive log files to find specific errors." 
  },
  { 
    cmd: "netstat", 
    desc: "Shows network connections, routing tables, and stats.\nSecurity analysts use this to identify open ports and active connections." 
  },
  { 
    cmd: "nmap -sV", 
    desc: "Scans a target for open ports and service versions.\nAnalyzes responses to guess which software version is running on a target." 
  },
  { 
    cmd: "sqlmap", 
    desc: "Automates detection and exploitation of SQL injection flaws.\nUsed by testers to verify if a database can be compromised via web inputs." 
  },
  { 
    cmd: "exit", 
    desc: "Terminates the current shell session.\nCloses the terminal window or disconnects from a remote SSH session." 
  }
]

type GameLog = {
  command: string
  description: string
  status: "success" | "missed"
  timeTaken: number
}

export default function TerminalGamePage() {
  const router = useRouter()

  // Game State
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "gameover">("idle")
  
  // LOGIC STATE (Refs for real-time accuracy)
  const livesRef = useRef(3)
  const roundDurationRef = useRef(7)
  const timeLeftRef = useRef(7.0)
  
  // UI State (For rendering)
  const [uiLives, setUiLives] = useState(3)
  const [uiTimeLeft, setUiTimeLeft] = useState(7.0)
  const [uiRoundDuration, setUiRoundDuration] = useState(7)

  // Round State
  const [currentCmdObj, setCurrentCmdObj] = useState(COMMAND_POOL[0])
  const [userInput, setUserInput] = useState("")
  const [isShake, setIsShake] = useState(false)

  // History/Logs
  const [gameHistory, setGameHistory] = useState<GameLog[]>([])

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const processingRef = useRef(false) // Prevents double-firing

  // --- GAME LOGIC ---
  const startGame = () => {
    setGameStatus("playing")
    
    // Reset Logic Refs
    livesRef.current = 3
    roundDurationRef.current = 7
    timeLeftRef.current = 7.0
    
    // Reset UI State
    setUiLives(3)
    setUiRoundDuration(7)
    setGameHistory([])
    
    nextRound(true) 
  }

  const nextRound = (isReset = false) => {
    processingRef.current = false
    
    // 1. Pick new command
    const randomObj = COMMAND_POOL[Math.floor(Math.random() * COMMAND_POOL.length)]
    setCurrentCmdObj(randomObj)
    setUserInput("")
    
    // 2. Set Time for this round
    const nextDuration = isReset ? 7 : Math.max(2, roundDurationRef.current)
    roundDurationRef.current = nextDuration
    timeLeftRef.current = nextDuration
    
    // Sync UI
    setUiRoundDuration(nextDuration)
    setUiTimeLeft(nextDuration)
    
    // 3. Auto-focus
    setTimeout(() => inputRef.current?.focus(), 50)

    // 4. Start Timer
    if (timerRef.current) clearInterval(timerRef.current)
    
    timerRef.current = setInterval(() => {
      // Decrement Ref
      timeLeftRef.current -= 0.1
      
      // Update UI
      setUiTimeLeft(Math.max(0, timeLeftRef.current))

      // Check Death
      if (timeLeftRef.current <= 0.05) { 
        handleRoundEnd("missed") 
      }
    }, 100)
  }

  // Calculate Penalty based on Rules
  const getPenaltyAmount = (currentTime: number) => {
    if (currentTime > 35) return 10
    if (currentTime > 20) return 5
    return 1
  }

  const handleRoundEnd = (status: "success" | "missed") => {
    if (processingRef.current) return // Stop double calls
    processingRef.current = true
    
    if (timerRef.current) clearInterval(timerRef.current)

    // Log Result
    const timeUsed = Math.max(0, roundDurationRef.current - timeLeftRef.current)
    setGameHistory(prev => {
      const exists = prev.find(p => p.command === currentCmdObj.cmd);
      if (exists) return prev;
      return [...prev, {
        command: currentCmdObj.cmd,
        description: currentCmdObj.desc,
        status: status,
        timeTaken: parseFloat(timeUsed.toFixed(1))
      }]
    })

    if (status === "missed") {
      triggerShake()
      
      // DECREASE LIFE (Using Ref for immediate logic)
      livesRef.current -= 1
      setUiLives(livesRef.current) // Sync UI

      // PENALTY: Decrease NEXT round duration
      const penalty = getPenaltyAmount(roundDurationRef.current)
      roundDurationRef.current = Math.max(2, roundDurationRef.current - penalty)

      // CHECK GAME OVER
      if (livesRef.current <= 0) {
        gameOver()
      } else {
        setTimeout(() => nextRound(), 500)
      }
    } else {
      // SUCCESS: Increase NEXT round duration
      roundDurationRef.current += 1
      nextRound()
    }
  }

  const gameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameStatus("gameover")
    
    // ✅ FIX 2: Changed type from "game" to "quiz" to satisfy your Type Definition
    // If you want "game", you must add | "game" to your ActivityType in lib/activity.ts
    recordActivity({ 
        type: "quiz", 
        description: `Breach Protocol - Survived ${gameHistory.length} rounds`, 
        points: gameHistory.length * 15 
    })
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUserInput(val)

    // TYPO CHECK
    if (!currentCmdObj.cmd.startsWith(val)) {
      triggerShake()
      // TYPO PENALTY: Reduce CURRENT timer immediately
      const penalty = getPenaltyAmount(timeLeftRef.current)
      timeLeftRef.current = Math.max(0, timeLeftRef.current - penalty)
      setUiTimeLeft(timeLeftRef.current) // Force UI update
      
      if (timeLeftRef.current <= 0) {
        handleRoundEnd("missed")
      }
      return
    }

    // SUCCESS CHECK
    if (val === currentCmdObj.cmd) {
      handleRoundEnd("success")
    }
  }

  const triggerShake = () => {
    setIsShake(true)
    setTimeout(() => setIsShake(false), 500)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-lime-400 font-mono relative overflow-hidden flex flex-col items-center justify-center p-4">
        
        {/* CRT & GLOW EFFECTS */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[size:100%_2px,3px_100%]" />
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,transparent_50%,#000_100%)] z-40" />

        {/* TOP BAR */}
        <div className="absolute top-0 w-full p-6 flex justify-between items-center z-30">
           <div className="flex items-center gap-3 opacity-70">
             <Terminal className="h-5 w-5" />
             <span className="text-sm tracking-[0.2em] uppercase">Breach Protocol v5.0</span>
           </div>
           <Button 
             variant="ghost" 
             className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
             onClick={() => router.back()}
           >
             <X className="mr-2 h-4 w-4" /> ABORT MISSION
           </Button>
        </div>

        {/* MAIN CONTENT */}
        <div className="w-full max-w-4xl relative z-20">
          <AnimatePresence mode="wait">
            
            {/* 1. START SCREEN */}
            {gameStatus === "idle" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-12"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-lime-400 blur-2xl opacity-20 animate-pulse" />
                  <Keyboard className="h-24 w-24 text-lime-400 relative z-10 mx-auto" />
                </div>
                
                <h1 className="text-5xl font-black text-white tracking-tighter">TERMINAL <span className="text-lime-400">DRILL</span></h1>

                <div className="max-w-lg mx-auto bg-lime-900/10 border border-lime-500/30 p-6 rounded-lg text-left space-y-3 text-sm">
                   <h3 className="text-white font-bold flex items-center gap-2 border-b border-lime-500/30 pb-2 mb-2">
                      <Cpu className="h-4 w-4" /> MISSION RULES:
                   </h3>
                   <ul className="space-y-2 text-lime-300/80 list-disc pl-4">
                      <li><strong>Lives:</strong> You have 3 attempts. Missing 3 times terminates connection.</li>
                      <li><strong>Success:</strong> +1 sec added to total time for the next round.</li>
                      <li><strong>Timeout:</strong> Lose 1 Life. Next round time decreases.</li>
                      <li><strong>Typo:</strong> Lose CURRENT time immediately.</li>
                      <li><strong>Surge:</strong> Time &gt; 20s = -5s penalty. Time &gt; 35s = -10s penalty.</li>
                   </ul>
                </div>

                <Button 
                  onClick={startGame} 
                  className="bg-lime-500 hover:bg-lime-400 text-black font-bold px-12 h-16 text-xl tracking-widest border-2 border-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all hover:scale-105"
                >
                  <Power className="mr-3 h-6 w-6" /> INITIALIZE
                </Button>
              </motion.div>
            )}

            {/* 2. PLAYING SCREEN */}
            {gameStatus === "playing" && (
              <motion.div 
                key="game"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`w-full ${isShake ? "animate-shake" : ""}`}
              >
                {/* HUD */}
                <div className="flex justify-between items-end mb-8 px-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase text-lime-400/60 tracking-widest">Connection Stability</span>
                      <div className="flex gap-2">
                         {[...Array(3)].map((_, i) => (
                            <Heart 
                               key={i} 
                               className={`h-6 w-6 transition-all duration-300 ${
                                  i < uiLives ? "fill-lime-400 text-lime-400 drop-shadow-[0_0_8px_lime]" : "fill-transparent text-red-900/30"
                               }`} 
                            />
                         ))}
                      </div>
                   </div>

                   <div className="text-right">
                      <span className="text-xs uppercase text-lime-400/60 tracking-widest">Time Remaining</span>
                      <div className={`text-4xl font-mono font-bold ${uiTimeLeft < 3.0 ? "text-red-500 animate-pulse" : "text-white"}`}>
                         {uiTimeLeft.toFixed(1)}s
                      </div>
                   </div>
                </div>

                {/* COMMAND DISPLAY */}
                <div className="relative mb-12 text-center">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-8xl font-black text-lime-900/20 select-none blur-sm whitespace-nowrap">
                      {currentCmdObj.cmd}
                   </div>
                   
                   <div className="relative z-10 text-5xl md:text-7xl font-bold font-mono tracking-wider flex justify-center gap-1">
                      {currentCmdObj.cmd.split('').map((char, index) => {
                        const userChar = userInput[index]
                        let color = "text-lime-900" 
                        if (userChar) {
                          color = userChar === char ? "text-lime-400 drop-shadow-[0_0_10px_rgba(132,204,22,0.8)]" : "text-red-500 bg-red-900/20"
                        }
                        return (
                          <span key={index} className={`transition-colors duration-75 ${color}`}>
                            {char === " " ? "\u00A0" : char}
                          </span>
                        )
                      })}
                   </div>
                </div>

                {/* INPUT */}
                <Card className="bg-black/50 border border-lime-500/50 backdrop-blur-md overflow-hidden relative max-w-xl mx-auto">
                  <div className="p-6 flex items-center gap-4">
                    <span className="text-lime-500 font-bold animate-pulse text-xl">{">"}</span>
                    <input 
                      ref={inputRef}
                      type="text" 
                      value={userInput}
                      onChange={handleInput}
                      className="bg-transparent border-none outline-none text-lime-400 w-full font-mono text-2xl uppercase placeholder:text-lime-900/30"
                      placeholder="TYPE COMMAND..."
                      autoFocus
                      autoComplete="off"
                    />
                    <Cpu className={`h-6 w-6 ${uiTimeLeft < 3.0 ? "text-red-500 animate-spin" : "text-lime-900"}`} />
                  </div>
                </Card>

                <p className="text-center mt-8 text-xs text-lime-900 uppercase tracking-[0.3em]">
                   Current Level: {uiRoundDuration.toFixed(1)}s / Cmd
                </p>
              </motion.div>
            )}

            {/* 3. GAME OVER SCREEN */}
            {gameStatus === "gameover" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl mx-auto bg-black/80 border border-lime-500/30 rounded-xl overflow-hidden backdrop-blur-md"
              >
                <div className="p-8 text-center border-b border-lime-500/20 bg-lime-900/10">
                   <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
                   <h2 className="text-3xl font-black text-white mb-1">CONNECTION LOST</h2>
                   <p className="text-lime-400/60 uppercase tracking-widest text-sm">Session Terminated by Firewall</p>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-lime-900 scrollbar-track-black">
                   {gameHistory.length === 0 && <p className="text-center text-lime-500/50 py-8">No commands executed.</p>}
                   {gameHistory.map((log, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-start gap-4 p-4 rounded border border-lime-900/30 bg-lime-900/5 hover:bg-lime-900/10 transition-colors">
                         <div className="mt-1">
                            {log.status === "success" 
                               ? <CheckCircle2 className="h-6 w-6 text-lime-500" />
                               : <XCircle className="h-6 w-6 text-red-500" />
                            }
                         </div>
                         <div className="flex-1 text-left">
                            <div className="flex justify-between items-center mb-1">
                               <p className="text-white font-bold font-mono text-xl">{log.command}</p>
                               <Badge variant="outline" className={log.status === "success" ? "border-lime-500 text-lime-500" : "border-red-500 text-red-500"}>
                                  {log.timeTaken}s
                               </Badge>
                            </div>
                            <p className="text-sm text-lime-400/60 leading-relaxed whitespace-pre-line">
                              {log.description}
                            </p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="p-6 border-t border-lime-500/20 flex gap-4">
                   <Button onClick={() => router.back()} variant="outline" className="flex-1 border-lime-500/30 text-lime-400 hover:bg-lime-900/20">
                     EXIT
                   </Button>
                   <Button onClick={startGame} className="flex-1 bg-lime-500 hover:bg-lime-400 text-black font-bold">
                     {/* ✅ FIX: Clock is now imported correctly */}
                     <Clock className="mr-2 h-4 w-4" /> RECONNECT
                   </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          .animate-shake {
            animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>
      </div>
    </AuthGuard>
  )
}