"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, ShieldAlert, Cpu, Keyboard, Power, X, CheckCircle2, XCircle, Heart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AuthGuard from "@/components/auth-guard"
import { useRouter } from "next/navigation" 
import { recordActivity } from "@/lib/activity"

// --- COMMAND DATA (Ordered: First 5 are Simple Daily Life, followed by Professional & Advanced) ---
const COMMAND_POOL = [
  // --- First 5: Simple Daily Life Commands (Guaranteed to appear first) ---
  { 
    cmd: "ls", 
    desc: "Lists all files and directories within the current folder context.\nUsing flags like '-a' reveals hidden configuration files." 
  },
  { 
    cmd: "cd", 
    desc: "Changes the shell's current working directory to a specific path.\nYou can navigate using relative paths like '..' to go up one level." 
  },
  { 
    cmd: "pwd", 
    desc: "Prints the absolute path of the current working directory.\nCrucial for verifying exactly where you are in the filesystem." 
  },
  { 
    cmd: "whoami", 
    desc: "Displays the username of the current user invoking the command.\nQuickly verifies your active permission state in the terminal." 
  },
  { 
    cmd: "clear", 
    desc: "Clears all visible text from the terminal screen.\nKeeps your workspace clean and tidy during long sessions." 
  },

  // --- Professional, Security, & Advanced Commands Follow ---
  { 
    cmd: "nmap -sV", 
    desc: "Scans a target for open ports and service versions.\nAnalyzes responses to guess which software version is running on a target." 
  },
  { 
    cmd: "sqlmap", 
    desc: "Automates detection and exploitation of SQL injection flaws.\nUsed by testers to verify if a database can be compromised via web inputs." 
  },
  { 
    cmd: "netstat", 
    desc: "Shows network connections, routing tables, and stats.\nSecurity analysts use this to identify open ports and active connections." 
  },
  { 
    cmd: "grep error", 
    desc: "Searches text data for lines matching a pattern.\nExtremely powerful for filtering massive log files to find specific errors." 
  },
  { 
    cmd: "ps aux", 
    desc: "Displays a snapshot of all running processes.\nShows Process ID (PID), CPU/Memory usage, and the user owner." 
  },
  { 
    cmd: "chmod +x", 
    desc: "Adds the 'executable' permission to a file.\nNecessary to run a script directly from the shell using './filename'." 
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
    cmd: "tcpdump", 
    desc: "Captures packets passing through a network interface.\nEssential for deep network traffic inspection and forensic analysis." 
  },
  { 
    cmd: "hydra", 
    desc: "A high-speed login cracker supporting multiple protocols.\nUsed during authorized penetration tests to audit weak passwords." 
  },
  { 
    cmd: "john", 
    desc: "Performs offline password hash cracking.\nTests system security by attempting to reverse hashed passwords into plaintext." 
  },
  { 
    cmd: "mkdir", 
    desc: "Creates a new directory (folder) at the specified path.\nUse the '-p' flag to create complex nested folders instantly." 
  },
  { 
    cmd: "touch", 
    desc: "Updates a file's timestamp or creates an empty file if it doesn't exist.\nCommonly used to create quick scratchpads or notes." 
  },
  { 
    cmd: "rm", 
    desc: "Removes files or directories from the filesystem.\nBe careful, deleted files bypass the desktop trash bin." 
  },
  { 
    cmd: "cp", 
    desc: "Copies a source file or directory to a new destination.\nCreates an exact duplicate while keeping your original file safe." 
  },
  { 
    cmd: "mv", 
    desc: "Moves a file to a new directory or renames it.\nAllows you to easily organize your documents and projects." 
  },
  { 
    cmd: "cat", 
    desc: "Outputs a file's entire content directly to the terminal screen.\nBest for reviewing configuration files or short notes." 
  },
  { 
    cmd: "history", 
    desc: "Displays a list of all previously executed commands in your session.\nHelps you quickly recall a complex command you ran earlier." 
  },
  { 
    cmd: "df -h", 
    desc: "Shows available disk space on your file systems in a human-readable format.\nGreat for checking if your storage is filling up." 
  },
  { 
    cmd: "exit", 
    desc: "Terminates the current shell session or window.\nSafely closes out your terminal workspace when you're done." 
  },
  { 
    cmd: "find / -name '*.log' 2>/dev/null", 
    desc: "Recursively searches the entire filesystem for all log files while suppressing permission errors.\nEssential for deep forensic audits and finding buried application logs." 
  },
  { 
    cmd: "tar -czvf backup.tar.gz /var/www/html", 
    desc: "Compresses a directory into a single gzipped archive file.\nWidely used by system administrators for taking quick, portable website backups." 
  },
  { 
    cmd: "netstat -tulnp | grep LISTEN", 
    desc: "Lists all active network ports currently listening for incoming connections along with their Process IDs.\nCrucial for identifying rogue background services." 
  },
  { 
    cmd: "awk '{print $1}' /var/log/nginx/access.log", 
    desc: "Extracts specific columns from text files using pattern scanning.\nFrequently used in security analytics to pull out raw IP addresses from web logs." 
  },
  { 
    cmd: "systemctl status sshd --no-pager", 
    desc: "Checks the operational status of the Secure Shell daemon service without opening an interactive scrolling view.\nUsed in automated server health checks." 
  },
  { 
    cmd: "history | grep 'sudo apt'", 
    desc: "Searches through your previously executed command history to find past software installation commands.\nHelps track historical server modifications." 
  },
  { 
    cmd: "journalctl -u nginx.service -e", 
    desc: "Jumps directly to the end of the systemd journal logs specifically for the Nginx web server.\nIndispensable for quick web debugging." 
  },
  { 
    cmd: "curl -I https://securityx.in", 
    desc: "Performs a lightweight HTTP HEAD request to fetch only the server response headers and status codes.\nUsed to inspect security policies and cookies." 
  },
  { 
    cmd: "openssl s_client -connect securityx.in:443", 
    desc: "Establishes a raw SSL/TLS connection socket to inspect security certificates, cipher suites, and handshake protocols.\nVital for cryptography audits." 
  },
  { 
    cmd: "iptables -L -v -n --line-numbers", 
    desc: "Displays the active Linux firewall rule tables with verbose packet counters and line numbers.\nUsed by system defenders to audit packet filtering." 
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
  
  // LOGIC STATE
  const livesRef = useRef(3)
  const roundDurationRef = useRef(7)
  const timeLeftRef = useRef(7.0)
  
  // UI State
  const [uiLives, setUiLives] = useState(3)
  const [uiTimeLeft, setUiTimeLeft] = useState(7.0)
  const [uiRoundDuration, setUiRoundDuration] = useState(7)

  // Round State
  const [currentCmdObj, setCurrentCmdObj] = useState(COMMAND_POOL[0])
  const [userInput, setUserInput] = useState("")
  const [isShake, setIsShake] = useState(false)

  // History & Anti-Repeat Queue (Tracks last 10 commands)
  const [gameHistory, setGameHistory] = useState<GameLog[]>([])
  const recentCommandsRef = useRef<string[]>([])

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const processingRef = useRef(false)

  // --- GAME LOGIC ---
  const startGame = () => {
    setGameStatus("playing")
    livesRef.current = 3
    roundDurationRef.current = 7
    timeLeftRef.current = 7.0
    
    setUiLives(3)
    setUiRoundDuration(7)
    setGameHistory([])
    recentCommandsRef.current = []
    
    nextRound(true) 
  }

  const nextRound = (isReset = false) => {
  processingRef.current = false
  
  let randomObj;
  // If we haven't finished the first 5 commands yet during a fresh game, pick them in order!
  if (isReset && recentCommandsRef.current.length === 0) {
    randomObj = COMMAND_POOL[0]; // starts with 'ls'
  } else if (recentCommandsRef.current.length < 5 && isReset) {
    randomObj = COMMAND_POOL[recentCommandsRef.current.length];
  } else {
    // Standard random picker with your 10-command anti-repeat filter
    const available = COMMAND_POOL.filter(item => !recentCommandsRef.current.includes(item.cmd))
    const poolToUse = available.length > 0 ? available : COMMAND_POOL
    randomObj = poolToUse[Math.floor(Math.random() * poolToUse.length)]
  }

  recentCommandsRef.current.push(randomObj.cmd)
  if (recentCommandsRef.current.length > 10) {
    recentCommandsRef.current.shift()
  }

  setCurrentCmdObj(randomObj)
  setUserInput("")
    
    const nextDuration = isReset ? 7 : Math.max(2, roundDurationRef.current)
    roundDurationRef.current = nextDuration
    timeLeftRef.current = nextDuration
    
    setUiRoundDuration(nextDuration)
    setUiTimeLeft(nextDuration)
    
    setTimeout(() => inputRef.current?.focus(), 50)

    if (timerRef.current) clearInterval(timerRef.current)
    
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 0.1
      setUiTimeLeft(Math.max(0, timeLeftRef.current))

      if (timeLeftRef.current <= 0.05) { 
        handleRoundEnd("missed") 
      }
    }, 100)
  }

  const getPenaltyAmount = (currentTime: number) => {
    if (currentTime > 35) return 10
    if (currentTime > 20) return 5
    return 1
  }

  const handleRoundEnd = (status: "success" | "missed") => {
    if (processingRef.current) return 
    processingRef.current = true
    
    if (timerRef.current) clearInterval(timerRef.current)

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
      livesRef.current -= 1
      setUiLives(livesRef.current)

      const penalty = getPenaltyAmount(roundDurationRef.current)
      roundDurationRef.current = Math.max(2, roundDurationRef.current - penalty)

      if (livesRef.current <= 0) {
        gameOver()
      } else {
        setTimeout(() => nextRound(), 500)
      }
    } else {
      roundDurationRef.current += 1
      nextRound()
    }
  }

  const gameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameStatus("gameover")
    
    recordActivity({ 
        type: "quiz", 
        description: `Breach Protocol - Survived ${gameHistory.length} rounds`, 
        points: gameHistory.length * 15 
    })
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUserInput(val)

    if (!currentCmdObj.cmd.startsWith(val)) {
      triggerShake()
      const penalty = getPenaltyAmount(timeLeftRef.current)
      timeLeftRef.current = Math.max(0, timeLeftRef.current - penalty)
      setUiTimeLeft(timeLeftRef.current)
      
      if (timeLeftRef.current <= 0) {
        handleRoundEnd("missed")
      }
      return
    }

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
        
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[size:100%_2px,3px_100%]" />
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,transparent_50%,#000_100%)] z-40" />

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

        <div className="w-full max-w-4xl relative z-20">
          <AnimatePresence mode="wait">
            
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

            {gameStatus === "playing" && (
              <motion.div 
                key="game"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`w-full ${isShake ? "animate-shake" : ""}`}
              >
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

                {/* COMMAND DISPLAY WRAPPER WITH OVERFLOW HANDLING FOR LONG LINES */}
                <div className="relative mb-12 text-center px-4">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl font-black text-lime-900/20 select-none blur-sm whitespace-nowrap overflow-hidden max-w-full">
                      {currentCmdObj.cmd}
                   </div>
                   
                   {/* Wrapping container for long commands */}
                   <div className="relative z-10 text-2xl md:text-5xl font-bold font-mono tracking-wider flex flex-wrap justify-center gap-1 max-w-full overflow-x-auto break-all py-2">
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

                <Card className="bg-black/50 border border-lime-500/50 backdrop-blur-md overflow-hidden relative max-w-xl mx-auto">
                  <div className="p-6 flex items-center gap-4">
                    <span className="text-lime-500 font-bold animate-pulse text-xl">{">"}</span>
                    <input 
                      ref={inputRef}
                      type="text" 
                      value={userInput}
                      onChange={handleInput}
                      className="bg-transparent border-none outline-none text-lime-400 w-full font-mono text-xl md:text-2xl normal-case placeholder:text-lime-900/30"
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