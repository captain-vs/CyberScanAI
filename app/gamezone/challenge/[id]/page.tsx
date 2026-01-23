"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Lightbulb, Flag, ArrowLeft, Terminal, Lock, RotateCcw } from "lucide-react"
import Link from "next/link"
import { recordActivity } from "@/lib/activity"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"

// --- CHALLENGE DATA (Ensure you have all c1-c15 + l1-l3 here) ---
const challengeData: Record<string, any> = {
  c1: { title: "Password Cracking Basics", difficulty: "Easy", points: 100, description: "Analyze weak passwords.", objective: "Find the password hidden in the provided hash", story: "Intercepted hash: 5f4dcc3b5aa765d61d8327deb882cf99.", hints: ["Common passwords", "English word", "MD5"], flag: "password" },
  c2: { title: "Network Traffic Analysis", difficulty: "Medium", points: 250, description: "Analyze packets.", objective: "Identify malicious IP", story: "Suspicious IP: 192.168.1.xxx (sum of first 3 primes).", hints: ["2, 3, 5", "Sum them", "192.168.1.10"], flag: "192.168.1.10" },
  c3: { title: "SQL Injection Challenge", difficulty: "Medium", points: 300, description: "Exploit DB.", objective: "Extract admin password", story: "Login vulnerable to SQLi.", hints: ["Make query true", "Single quote", "' OR '1'='1"], flag: "' OR '1'='1" },
  c4: { title: "XSS Attack Simulation", difficulty: "Medium", points: 280, description: "Identify XSS.", objective: "Steal session cookies", story: "Inject JS to alert cookies.", hints: ["<script>", "document.cookie", "alert()"], flag: "<script>alert(document.cookie)</script>" },
  c5: { title: "API Security Testing", difficulty: "Medium", points: 320, description: "Bypass API auth.", objective: "Bypass auth", story: "Header 'X-Admin: false'.", hints: ["Change header", "X-Admin: true"], flag: "X-Admin: true" },
  c6: { title: "Privilege Escalation Lab", difficulty: "Hard", points: 450, description: "Gain admin.", objective: "Escalate privileges", story: "SUID binary reads config.", hints: ["SUID", "Symlink"], flag: "symlink-attack" },
  c7: { title: "Reverse Engineering", difficulty: "Hard", points: 500, description: "Decompile binary.", objective: "Find hidden flag", story: "Password for binary? Input 'reverse123'.", hints: ["strings command", "embedded text"], flag: "reverse123" },
  c8: { title: "Cryptography Puzzle", difficulty: "Hard", points: 400, description: "Decrypt layers.", objective: "Decrypt message", story: "ROT13 then Base64: VmVyeSBTZWNyZXQgTWVzc2FnZQ==", hints: ["Decode Base64", "ROT13"], flag: "Secret Message" },
  c9: { title: "Social Engineering Defense", difficulty: "Easy", points: 150, description: "Identify phishing.", objective: "Identify fake domain", story: "Email from support@bankofamerica-secure.xyz", hints: ["Check extension"], flag: "xyz" },
  c10: { title: "Container Security", difficulty: "Hard", points: 480, description: "Docker escape.", objective: "Escape container", story: "Docker socket mounted.", hints: ["Socket abuse"], flag: "docker-socket-escape" },
  c11: { title: "IoT Device Hacking", difficulty: "Medium", points: 290, description: "Default creds.", objective: "Access admin", story: "Username 'admin'. Password?", hints: ["Weak defaults", "admin"], flag: "admin123" },
  c12: { title: "Blockchain Security", difficulty: "Hard", points: 520, description: "Smart contract bugs.", objective: "Exploit reentrancy", story: "Recursively call withdraw.", hints: ["Reentrancy"], flag: "reentrancy" },
  c13: { title: "Cloud Misconfiguration", difficulty: "Medium", points: 310, description: "S3 buckets.", objective: "Find bucket", story: "Bucket pattern: company-backup-year", hints: ["2025"], flag: "company-backup-2025" },
  c14: { title: "Wireless Hacking", difficulty: "Hard", points: 470, description: "Crack WPA2.", objective: "Crack WiFi", story: "Captured handshake.", hints: ["hashcat"], flag: "hashcat" },
  c15: { title: "Mobile App Security", difficulty: "Medium", points: 300, description: "Decompile APK.", objective: "Extract API key", story: "Hardcoded creds.", hints: ["jadx"], flag: "jadx" },
  l1: { title: "Linux Basics: File Hunt", difficulty: "Easy", points: 150, description: "Navigate directories.", objective: "Find flag.txt", story: "Use ls and cat.", hints: ["ls", "cat"], flag: "linux_master_1", isTerminal: true, initialOutput: ["Welcome to Ubuntu"], fileSystem: { "flag.txt": "linux_master_1" } },
  l2: { title: "Linux Permissions", difficulty: "Medium", points: 250, description: "Fix permissions.", objective: "Run script.sh", story: "Permission denied.", hints: ["chmod +x"], flag: "rwx_power_user", isTerminal: true, initialOutput: ["-rw-r--r-- script.sh"], fileSystem: { "script.sh": "ECHO: rwx_power_user" } },
  l3: { title: "Linux Grep", difficulty: "Medium", points: 300, description: "Search logs.", objective: "Find error code", story: "Search huge log.", hints: ["grep"], flag: "ERR_9921_X", isTerminal: true, initialOutput: ["server.log"], fileSystem: { "server.log": "CRITICAL_ERROR: The flag is ERR_9921_X" } },
}

// --- TERMINAL COMPONENT (Fixed Scroll & Click-to-Focus) ---
function LinuxTerminal({ challenge, onSolve }: any) {
  const [history, setHistory] = useState<string[]>(challenge.initialOutput)
  const [cmd, setCmd] = useState("")
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { 
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    const input = cmd.trim()
    const parts = input.split(" ")
    const command = parts[0]
    const arg = parts[1]
    
    let output = `$ ${input}`
    let response = ""

    if (command === "ls") response = Object.keys(challenge.fileSystem).join("  ")
    else if (command === "cat") response = challenge.fileSystem[arg] || `cat: ${arg}: No such file`
    else if (command === "chmod" && arg === "+x" && parts[2] === "script.sh") response = "Changed mode of script.sh to 755"
    else if (command === "./script.sh") response = challenge.id === "l2" ? challenge.fileSystem["script.sh"] : "Permission denied"
    else if (command === "grep") {
       if (challenge.fileSystem["server.log"]?.includes(arg)) response = "CRITICAL_ERROR: The flag is ERR_9921_X"
       else response = ""
    }
    else if (command === "help") response = "Available: ls, cat, chmod, grep, clear"
    else if (command === "clear") { setHistory([]); setCmd(""); return }
    else response = `${command}: command not found`

    setHistory([...history, output, response])
    setCmd("")

    if (response.includes(challenge.flag)) onSolve(challenge.flag)
  }

  // 🟢 CLICK ANYWHERE TO FOCUS INPUT
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div 
      ref={terminalRef}
      onClick={handleContainerClick} // 🟢 Triggers focus
      className="bg-black text-green-400 font-mono p-4 rounded-lg h-64 overflow-y-auto mb-4 border border-green-500/30 shadow-inner cursor-text"
    >
      {history.map((line, i) => <div key={i} className="whitespace-pre-wrap">{line}</div>)}
      <form onSubmit={handleCommand} className="flex gap-2 mt-2">
        <span>$</span>
        <input 
          ref={inputRef} // 🟢 Connected to ref
          value={cmd} 
          onChange={(e) => setCmd(e.target.value)} 
          className="bg-transparent outline-none flex-1" 
          autoFocus 
          autoComplete="off"
        />
      </form>
    </div>
  )
}

export default function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const challenge = challengeData[id]

  const [answer, setAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)

  useEffect(() => {
    if (auth.currentUser) {
      const checkCompletion = async () => {
        const docRef = doc(db, "users", auth.currentUser!.uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          const data = snap.data()
          if (data.completedChallenges?.includes(id)) {
            setAlreadyCompleted(true)
          }
        }
      }
      checkCompletion()
    }
  }, [id])

  if (!challenge) return <div>Challenge Not Found</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    checkAnswer(answer)
  }

  const checkAnswer = async (inputVal: string) => {
    const cleanInput = inputVal.trim().toLowerCase()
    const cleanFlag = challenge.flag.toLowerCase()

    if (cleanInput === cleanFlag) {
      setIsCorrect(true)
      setShowResult(true)
      
      if (!alreadyCompleted) {
        await recordActivity({
          type: "challenge",
          description: `Solved: ${challenge.title}`,
          points: challenge.points
        })
        if (auth.currentUser) {
           await updateDoc(doc(db, "users", auth.currentUser.uid), {
             completedChallenges: arrayUnion(id)
           })
        }
      } 
      setTimeout(() => router.push("/gamezone"), 2500)
    } else {
      setIsCorrect(false)
      setShowResult(true)
    }
  }

  const revealHint = () => {
    if (hintsRevealed < challenge.hints.length) setHintsRevealed(hintsRevealed + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen bg-[var(--background)]">
      <Button variant="ghost" asChild className="mb-4 text-slate-400 hover:text-white">
        <Link href="/gamezone"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Link>
      </Button>

      {alreadyCompleted && (
        <Alert className="mb-6 bg-green-500/10 border-green-500/50 text-green-500">
           <RotateCcw className="h-4 w-4" />
           <AlertDescription className="font-semibold">
              Replay Mode Active: You have already completed this challenge. No points will be awarded.
           </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card className="border-slate-800 bg-[#0f141f]">
          <CardHeader>
             <div className="flex gap-2 mb-2">
               <Badge className="bg-slate-700">{challenge.difficulty}</Badge>
               <Badge variant={alreadyCompleted ? "outline" : "secondary"}>
                 {alreadyCompleted ? "0 PTS (Replay)" : `${challenge.points} PTS`}
               </Badge>
             </div>
             <CardTitle className="text-3xl text-white">{challenge.title}</CardTitle>
             <CardDescription className="text-slate-400">{challenge.description}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-blue-900/10 border-blue-500/20">
          <CardHeader><CardTitle className="flex gap-2 text-white"><Flag className="h-5 w-5 text-blue-400"/> Mission</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-300 leading-relaxed">{challenge.story}</p>
            <div className="bg-[#0B1120] p-4 rounded border border-blue-500/20">
              <span className="font-bold text-blue-400">Objective: </span><span className="text-slate-200">{challenge.objective}</span>
            </div>
          </CardContent>
        </Card>

        {challenge.isTerminal && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader><CardTitle className="flex gap-2 text-green-500"><Terminal className="h-5 w-5"/> Terminal Access</CardTitle></CardHeader>
            <CardContent>
              <LinuxTerminal challenge={challenge} onSolve={(flag: string) => { setAnswer(flag); checkAnswer(flag) }} />
              <p className="text-xs text-muted-foreground">Tip: Use standard Linux commands.</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-800 bg-[#0f141f]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white"><Lightbulb className="h-5 w-5 text-yellow-500" /> Hints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hintsRevealed > 0 && (
              <div className="space-y-2">
                {challenge.hints.slice(0, hintsRevealed).map((hint: string, index: number) => (
                  <Alert key={index} className="bg-yellow-500/10 border-yellow-500/20">
                    <AlertDescription className="flex gap-2 text-yellow-200"><span className="font-bold text-yellow-500">{index + 1}.</span> {hint}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
            {hintsRevealed < challenge.hints.length ? (
              <Button onClick={revealHint} variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">Reveal Hint ({hintsRevealed + 1}/{challenge.hints.length})</Button>
            ) : (
              <Button disabled variant="secondary" className="w-full bg-slate-800 text-slate-500"><Lock className="mr-2 h-4 w-4" /> No more hints</Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-[#0f141f]">
          <CardHeader><CardTitle className="text-white">Submit Flag</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-400">Flag</Label>
                <Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter flag here..." className="font-mono bg-slate-900 border-slate-700 text-white" />
              </div>

              {showResult && (
                <Alert variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "border-green-500 text-green-500 bg-green-500/10" : ""}>
                  {isCorrect ? <CheckCircle className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                  <AlertDescription>
                    {isCorrect 
                       ? (alreadyCompleted ? "Correct! (Replay - No Points)" : `Correct! +${challenge.points} Points`) 
                       : "Incorrect flag. Keep trying!"}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isCorrect}>
                {isCorrect ? "Completed" : "Submit Flag"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}