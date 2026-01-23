"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Clock, User, PlayCircle, Beaker, CheckCircle2, XCircle, Terminal, ShieldAlert, Key, Lightbulb, ChevronRight, Lock, FileCode, Server, Globe, Layers } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import AuthGuard from "@/components/auth-guard"

// --- TYPES ---
type ContentBlock = {
  type: "paragraph" | "header" | "code" | "hint" | "list" | "alert" | "visualization"
  text?: string
  items?: string[] 
  title?: string 
  visType?: "ransomware" | "supply-chain" | "dark-web"
}

type ArticleData = {
  title: string
  author: string
  readTime: string
  category: string
  difficulty: string
  content: ContentBlock[]
  hasLab?: boolean
  labType?: "sql-injection" | "xss" | "2fa-setup" | "password-crack" | "command-injection" | "path-traversal"
}

// --- VISUALIZATION COMPONENTS ---
function AttackVisualization({ type }: { type: string }) {
  if (type === "ransomware") {
    return (
      <div className="my-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col items-center justify-center h-64 relative overflow-hidden">
        <p className="absolute top-4 left-4 text-xs text-slate-500 font-mono">ATTACK SIMULATION: ENCRYPTION</p>
        <div className="flex gap-4 items-center">
          <motion.div animate={{ backgroundColor: ["#10b981", "#ef4444"] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className="w-16 h-20 rounded-lg flex items-center justify-center border-2 border-slate-700"><FileCode className="text-white" /></motion.div>
          <motion.div animate={{ x: [0, 10, 0] }} className="text-red-500 font-mono">---&gt;</motion.div>
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }} className="w-16 h-20 bg-red-500/10 border-2 border-red-500 rounded-lg flex items-center justify-center"><Lock className="w-8 h-8 text-red-500" /></motion.div>
        </div>
        <p className="mt-4 text-sm text-red-400 font-mono animate-pulse">FILES ENCRYPTED. PAY RANSOM.</p>
      </div>
    )
  }
  if (type === "supply-chain") {
    return (
      <div className="my-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col items-center justify-center h-64 relative">
        <p className="absolute top-4 left-4 text-xs text-slate-500 font-mono">ATTACK FLOW: UPSTREAM INFECTION</p>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <motion.div animate={{ borderColor: ["#3b82f6", "#ef4444"] }} transition={{ duration: 2 }} className="w-12 h-12 rounded-full border-4 border-blue-500 bg-slate-800 flex items-center justify-center mb-2"><Server className="w-6 h-6 text-white"/></motion.div>
            <span className="text-xs text-slate-400">Vendor</span>
          </div>
          <motion.div className="flex gap-1">{[1,2,3].map(i => (<motion.div key={i} animate={{ opacity: [0, 1, 0], x: 20 }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} className="w-2 h-2 bg-red-500 rounded-full" />))}</motion.div>
          <div className="grid grid-cols-2 gap-2">{[1,2,3,4].map(i => (<motion.div key={i} animate={{ backgroundColor: ["#1e293b", "#450a0a"] }} transition={{ delay: 2, duration: 1 }} className="w-8 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center"><User className="w-4 h-4 text-slate-500"/></motion.div>))}</div>
        </div>
        <p className="mt-4 text-sm text-slate-400">1 Infected Update = Thousands of Compromised Clients</p>
      </div>
    )
  }
  if (type === "dark-web") {
    return (
      <div className="my-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col items-center justify-center h-64 relative overflow-hidden">
        <p className="absolute top-4 left-4 text-xs text-slate-500 font-mono">ONION ROUTING SIMULATION</p>
        <div className="flex justify-between items-center w-full max-w-md relative z-10">
          <div className="flex flex-col items-center"><Globe className="text-blue-400 mb-2"/><span className="text-xs text-slate-500">Client</span></div>
          <div className="flex gap-8">{[1, 2, 3].map((i) => (<motion.div key={i} animate={{ scale: [1, 1.1, 1], borderColor: ["#334155", "#10b981", "#334155"] }} transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }} className="w-10 h-10 rounded-full bg-black border-2 border-slate-700 flex items-center justify-center text-xs text-emerald-500 font-mono">N{i}</motion.div>))}</div>
          <div className="flex flex-col items-center"><Layers className="text-purple-500 mb-2"/><span className="text-xs text-slate-500">Hidden</span></div>
        </div>
        <motion.div className="absolute w-3 h-3 bg-white rounded-full z-20 shadow-[0_0_10px_white]" animate={{ left: ["10%", "35%", "50%", "65%", "90%"], opacity: [0, 1, 1, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ top: "50%", marginTop: "-6px" }} />
        <p className="mt-8 text-sm text-slate-400 font-mono">Traffic Bounces: <span className="text-emerald-400">Encrypted</span> &rarr; <span className="text-emerald-400">Relayed</span> &rarr; <span className="text-purple-400">Anonymized</span></p>
      </div>
    )
  }
  return null
}

// --- DATA ---
const articleData: Record<string, ArticleData> = {
  // --- TUTORIALS (Labs Included) ---
  t1: {
    title: "Complete Guide to 2FA & Auth Security",
    author: "Sarah Chen",
    readTime: "10 min",
    category: "Authentication",
    difficulty: "Beginner",
    hasLab: true,
    labType: "2fa-setup",
    content: [
      { type: "paragraph", text: "Two-factor authentication (2FA) is one of the most effective security measures available today. It operates on the principle of 'defense in depth,' requiring two distinct forms of identification before granting access." },
      { type: "header", text: "The Three Factors of Authentication" },
      { type: "list", items: ["Something you know: Passwords, PINs.", "Something you have: A smartphone, hardware token (YubiKey).", "Something you are: Biometrics like fingerprints, FaceID."] },
      { type: "paragraph", text: "True 2FA combines two *different* categories. Using two passwords is not 2FA; using a password and a fingerprint is." },
      { type: "header", text: "Understanding TOTP" },
      { type: "paragraph", text: "Most authenticator apps use the TOTP algorithm. The server and your device share a 'Secret Key'. Every 30 seconds, both use the current time and this secret key to generate a matching 6-digit code." },
      { type: "hint", title: "Lab Objective", text: "In the lab below, simulate scanning a QR code (which contains the Secret Key) and verify the generated token." },
      { type: "alert", title: "Security Warning", text: "SMS 2FA is vulnerable to 'SIM Swapping' attacks. Always prefer App-based or Hardware-based 2FA." }
    ],
  },
  t2: {
    title: "SQL Injection: Attack & Defense",
    author: "Michael Torres",
    readTime: "15 min",
    category: "Web Security",
    difficulty: "Intermediate",
    hasLab: true,
    labType: "sql-injection",
    content: [
      { type: "paragraph", text: "SQL Injection (SQLi) remains one of the top web vulnerabilities. It happens when an application takes user input and blindly inserts it into a database query string." },
      { type: "header", text: "The Mechanics of the Attack" },
      { type: "paragraph", text: "Imagine a login query that looks like this: `SELECT * FROM users WHERE username = '$user_input' AND password = '$password_input';`" },
      { type: "paragraph", text: "If a hacker enters `admin'--`, the `--` symbol comments out the password check. The query becomes 'Is the username admin?', which is True, allowing access." },
      { type: "hint", title: "Lab Solution", text: "Try the comment injection technique `admin'--` in the lab below to bypass the password field entirely." },
      { type: "alert", title: "Critical Defense", text: "Sanitization is not enough. You must use Parameterized Queries (Prepared Statements) which treat input strictly as data." }
    ],
  },
  t5: {
    title: "XSS (Cross-Site Scripting) Mastery",
    author: "Dr. James Wilson",
    readTime: "12 min",
    category: "Web Security",
    difficulty: "Intermediate",
    hasLab: true,
    labType: "xss",
    content: [
      { type: "paragraph", text: "Cross-Site Scripting (XSS) is a vulnerability where an attacker injects malicious scripts into content that is then served to other users. Unlike SQLi which targets the database, XSS targets the user's browser." },
      { type: "header", text: "Types of XSS" },
      { type: "list", items: ["Reflected XSS: The script comes from the current HTTP request.", "Stored XSS: The script is saved in the database (e.g., a comment).", "DOM-based XSS: Vulnerability exists in client-side code."] },
      { type: "header", text: "The Impact" },
      { type: "paragraph", text: "An attacker can use XSS to steal Session Cookies (allowing account takeover), redirect users to phishing sites, or deface websites." },
      { type: "hint", title: "Lab Challenge", text: "In the simulator, try to get the system to execute a simple alert box using `<script>alert(1)</script>`." },
    ],
  },
  t6: {
    title: "Password Cracking & Hash Analysis",
    author: "Robert Lee",
    readTime: "10 min",
    category: "Cryptography",
    difficulty: "Beginner",
    hasLab: true,
    labType: "password-crack",
    content: [
      { type: "paragraph", text: "When you create an account, a secure website never stores your password. It stores a 'hash'—a one-way mathematical fingerprint." },
      { type: "header", text: "Hashing Algorithms" },
      { type: "paragraph", text: "Fast algorithms like MD5 or SHA-1 are dangerous for passwords because modern computers can calculate billions of them per second using GPU clusters." },
      { type: "header", text: "Salting & Stretching" },
      { type: "paragraph", text: "To protect passwords, developers use 'Salts' (random data added to the password) and slow algorithms like Bcrypt or Argon2." },
      { type: "hint", title: "Lab Activity", text: "Experiment with password complexity. Notice how adding a special character like '!' or '$' drastically changes the resulting hash." },
    ],
  },
  t7: {
    title: "Command Injection: Owning the Server",
    author: "System Admin",
    readTime: "15 min",
    category: "Network Security",
    difficulty: "Advanced",
    hasLab: true,
    labType: "command-injection",
    content: [
      { type: "paragraph", text: "Command Injection is a critical vulnerability where an application blindly passes user input to a system shell. It allows attackers to execute Operating System commands." },
      { type: "header", text: "The Vulnerability" },
      { type: "paragraph", text: "Many routers have a 'Ping' tool. If the code is `$output = exec('ping ' . $ip);`, an attacker can use a semicolon `;` to separate commands." },
      { type: "code", text: "8.8.8.8; cat /etc/passwd" },
      { type: "paragraph", text: "This payload tells the server: 'Ping 8.8.8.8, AND THEN show me all user accounts'." },
      { type: "hint", title: "Lab Mission", text: "In the 'Network Tool' below, try to list the server's files by injecting `google.com; ls`." },
      { type: "alert", title: "Danger", text: "This vulnerability often leads to full server compromise (RCE)." }
    ]
  },
  t8: {
    title: "Path Traversal: Stealing Config Files",
    author: "Web Admin",
    readTime: "12 min",
    category: "Web Security",
    difficulty: "Intermediate",
    hasLab: true,
    labType: "path-traversal",
    content: [
      { type: "paragraph", text: "Path Traversal (or Directory Traversal) allows attackers to access files outside the web root folder." },
      { type: "header", text: "The Dot-Dot-Slash Attack" },
      { type: "paragraph", text: "In Linux/Unix systems, `../` means 'go up one folder'. By chaining these, you can reach the root directory." },
      { type: "code", text: "GET /download?file=../../../../etc/passwd" },
      { type: "hint", title: "Lab Mission", text: "The image viewer below loads files like `image1.jpg`. Try to load `../config.json` to steal the server secrets." }
    ]
  },

  // --- KNOWLEDGE BASE (Deep Dives + Visualizations) ---
  a4: {
    title: "Inside the Dark Web: Markets & Myths",
    author: "Cipher Collective",
    readTime: "25 min",
    category: "Dark Web",
    difficulty: "Advanced",
    content: [
      { type: "visualization", visType: "dark-web" },
      { type: "paragraph", text: "The 'Dark Web' refers to encrypted overlay networks that exist on the internet but require specific software, configurations, or authorization to access. The most famous of these is the Tor network (The Onion Router)." },
      { type: "header", text: "How Tor Privacy Works" },
      { type: "paragraph", text: "Tor anonymizes traffic by bouncing it through a series of at least three volunteer relays around the world. The 'Entry Node' knows who you are but not what you are visiting. The 'Exit Node' knows what you are visiting but not who you are. This separation of knowledge creates anonymity." },
      { type: "header", text: "Case Study: The Silk Road Takedown" },
      { type: "paragraph", text: "Silk Road was the archetype of the modern darknet market. It combined Tor for hiding server location and Bitcoin for hiding payment trails. However, it fell due to classic Operations Security (OpSec) failures." },
      { type: "list", items: [
        "Human Error: The founder, Ross Ulbricht, used his personal email address on a public forum to ask coding questions.",
        "Server Misconfiguration: The login page's CAPTCHA accidentally leaked the server's real IP address.",
        "Infiltration: Law enforcement infiltrated the admin team, gathering logs over months."
      ]},
      { type: "header", text: "Modern Dark Web Threats" },
      { type: "paragraph", text: "Today, the dark web is primarily used for the 'Access-as-a-Service' economy. Initial Access Brokers (IABs) sell corporate VPN credentials to Ransomware gangs. It is a highly professionalized supply chain of cybercrime." },
      { type: "alert", title: "Strategic Insight", text: "For defenders, monitoring the dark web for leaked credentials is a proactive necessity, not just an investigative step after a breach." }
    ],
  },
  a5: {
    title: "Ransomware 2.0: Double Extortion",
    author: "ThreatIntel Team",
    readTime: "18 min",
    category: "Threat Analysis",
    difficulty: "Intermediate",
    content: [
      { type: "visualization", visType: "ransomware" },
      { type: "paragraph", text: "The era of simple encryption is over. Since 2019, ransomware groups have adopted 'Double Extortion'. They don't just lock your data; they steal it first and threaten to publish it on leak sites if the ransom isn't paid." },
      { type: "header", text: "The Attack Lifecycle (Kill Chain)" },
      { type: "list", items: [
        "1. Initial Access: Phishing emails (70% of cases) or RDP brute-forcing.",
        "2. Lateral Movement: Using tools like Cobalt Strike or Mimikatz to jump from one computer to the Domain Controller.",
        "3. Exfiltration: Silently uploading terabytes of sensitive data to cloud storage.",
        "4. Encryption: The final step. Deploying the locker to paralyze operations."
      ]},
      { type: "header", text: "Case Study: The Colonial Pipeline" },
      { type: "paragraph", text: "This attack shut down the largest fuel pipeline in the U.S. The entry point was shockingly simple: a single compromised password for an inactive VPN account. The account did not have Multi-Factor Authentication (MFA)." },
      { type: "header", text: "Defense Strategies" },
      { type: "paragraph", text: "Backups are no longer enough because they don't stop the data leak extortion. Organizations must focus on preventing Lateral Movement." },
      { type: "alert", title: "Prevention Checklist", text: "1. Enforce MFA on ALL remote access.\n2. Use Network Segmentation (Air Gaps) between IT and OT networks.\n3. Implement EDR to catch Cobalt Strike beacons." }
    ],
  },
  a6: {
    title: "Supply Chain Attacks: SolarWinds",
    author: "Emily Rodriguez",
    readTime: "20 min",
    category: "Enterprise Security",
    difficulty: "Advanced",
    content: [
      { type: "visualization", visType: "supply-chain" },
      { type: "paragraph", text: "A supply chain attack targets a third-party vendor to gain access to their customers. It exploits the trust relationship between software providers and users." },
      { type: "header", text: "Deep Dive: SolarWinds (Sunburst)" },
      { type: "paragraph", text: "The SolarWinds hack is considered one of the most sophisticated cyber-espionage campaigns in history. Hackers compromised the 'build system' of the SolarWinds Orion software." },
      { type: "header", text: "How it Happened" },
      { type: "paragraph", text: "The attackers injected a tiny snippet of malicious code into the source code just before it was compiled into the final software update. This meant the malware was digitally signed by SolarWinds' valid certificate." },
      { type: "code", text: "SolarWinds.Orion.Core.BusinessLayer.dll" },
      { type: "paragraph", text: "Once installed on customer networks, the malware remained dormant for 14 days to evade sandboxes. It then communicated with C2 servers using steganography inside DNS requests." },
      { type: "header", text: "The Zero Trust Response" },
      { type: "paragraph", text: "This attack proved that we cannot implicitly trust signed software updates. This has accelerated the adoption of 'Zero Trust Architecture'—verify explicitly, use least privilege, and assume breach." },
      { type: "alert", title: "Key Lesson", text: "Perimeter firewalls are useless against supply chain attacks. You must monitor internal 'East-West' traffic for anomalous behavior." }
    ],
  },
}

// --- FULL RESTORED LAB COMPONENTS ---

function CommandInjectionLab() {
  const [target, setTarget] = useState("")
  const [output, setOutput] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "running" | "hacked">("idle")

  const runPing = () => {
    setStatus("running")
    setOutput([`Pinging ${target.split(';')[0]}...`, "Reply from server: bytes=32 time=14ms TTL=56"])
    setTimeout(() => {
      // Logic: Look for command separators and OS commands
      if (target.includes(";") || target.includes("|") || target.includes("&&")) {
        if (target.includes("ls")) {
          setOutput(prev => [...prev, "--- INJECTED COMMAND OUTPUT ---", "index.php", "admin_creds.txt", "users.db"])
          setStatus("hacked")
        } else if (target.includes("cat")) {
          setOutput(prev => [...prev, "--- INJECTED COMMAND OUTPUT ---", "root:x:0:0:root:/root:/bin/bash", "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin"])
          setStatus("hacked")
        } else {
          setOutput(prev => [...prev, "--- INJECTED COMMAND OUTPUT ---", "Command executed successfully (no output)"])
          setStatus("hacked")
        }
      } else {
        setStatus("idle")
      }
    }, 1000)
  }

  return (
    <Card className="border-2 border-red-500 bg-red-500/5 mb-8">
      <CardHeader>
        <CardTitle className="text-red-400 flex gap-2"><Terminal className="h-5 w-5"/> Command Injection Simulator</CardTitle>
        <CardDescription>Network Diagnostic Tool (Vulnerable to RCE)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Enter IP (e.g. 8.8.8.8; ls)" value={target} onChange={e => setTarget(e.target.value)} className="bg-black/50 border-slate-700 font-mono" />
          <Button onClick={runPing} className="bg-red-600 hover:bg-red-700">Ping</Button>
        </div>
        
        <div className="bg-black p-4 rounded border border-slate-800 font-mono text-sm h-48 overflow-y-auto">
          {output.length === 0 ? <span className="text-slate-600">Waiting for input...</span> : output.map((line, i) => (
            <div key={i} className={line.includes("INJECTED") ? "text-yellow-400 font-bold mt-2" : "text-green-400"}>{line}</div>
          ))}
        </div>
        {status === "hacked" && <div className="p-3 bg-red-500/20 text-red-400 rounded border border-red-500 flex items-center gap-2 animate-pulse"><ShieldAlert className="h-4 w-4"/> CRITICAL: OS Command Executed!</div>}
      </CardContent>
    </Card>
  )
}

function PathTraversalLab() {
  const [path, setPath] = useState("image1.jpg")
  const [content, setContent] = useState<any>("(Image Binary Data...)")
  const [hacked, setHacked] = useState(false)

  const loadFile = () => {
    if (path.includes("../")) {
      setHacked(true)
      setContent(
        <div className="text-yellow-400">
          {"{"}<br/>
          &nbsp;&nbsp;"db_host": "localhost",<br/>
          &nbsp;&nbsp;"db_user": "admin",<br/>
          &nbsp;&nbsp;"db_pass": "Sup3rS3cr3t!"<br/>
          {"}"}
        </div>
      )
    } else {
      setHacked(false)
      setContent("(Image Binary Data Displayed...)")
    }
  }

  return (
    <Card className="border-2 border-orange-500 bg-orange-500/5 mb-8">
      <CardHeader>
        <CardTitle className="text-orange-400 flex gap-2"><Server className="h-5 w-5"/> Directory Traversal Lab</CardTitle>
        <CardDescription>Vulnerable File Viewer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center bg-slate-900 p-2 rounded border border-slate-700">
          <span className="text-slate-500">GET /view?file=</span>
          <Input value={path} onChange={e => setPath(e.target.value)} className="bg-transparent border-none text-white focus-visible:ring-0" />
          <Button onClick={loadFile} size="sm" className="bg-orange-600">Go</Button>
        </div>
        
        <div className="bg-white/5 p-8 rounded border border-white/10 min-h-[150px] flex items-center justify-center font-mono text-sm">
          {content}
        </div>
        {hacked && <div className="p-3 bg-orange-500/20 text-orange-400 rounded border border-orange-500 flex items-center gap-2"><Lock className="h-4 w-4"/> SUCCESS: Confidential Config File Dumped!</div>}
      </CardContent>
    </Card>
  )
}

function XSSLab() {
  const [input, setInput] = useState("")
  const [comments, setComments] = useState<string[]>([])
  const [exploited, setExploited] = useState(false)

  const handlePost = () => {
    const xssPatterns = ["<script>alert", "javascript:alert", "onerror=alert", "<img src=x"]
    if (xssPatterns.some(pattern => input.toLowerCase().includes(pattern))) {
      setExploited(true)
    }
    setComments([...comments, input])
    setInput("")
  }

  return (
    <Card className="border-2 border-purple-500 bg-purple-500/5 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-400"><Terminal className="h-5 w-5"/> XSS Vulnerability Lab</CardTitle>
        <CardDescription>Try to inject a script to trigger an alert pop-up.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {exploited ? (
          <div className="p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg flex items-center gap-2 animate-pulse">
            <ShieldAlert className="h-5 w-5" /> 
            <span>XSS ATTACK SUCCESSFUL! Code Executed.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input 
                placeholder="Write a comment..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                className="bg-black/50 border-slate-700"
              />
              <Button onClick={handlePost} className="bg-purple-600 hover:bg-purple-700">Post</Button>
            </div>
          </div>
        )}
        <div className="mt-4 p-4 bg-black/30 rounded-lg min-h-[100px] border border-slate-800">
          <h4 className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Comment Feed (Unsanitized)</h4>
          {comments.length === 0 && <span className="text-slate-600 text-sm italic">No comments yet...</span>}
          {comments.map((c, i) => (
            <div key={i} className="p-2 border-b border-slate-800 text-slate-300 font-mono text-sm flex gap-2">
              <span className="text-purple-500">user@web:~$</span> {c}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PasswordLab() {
  const [password, setPassword] = useState("")
  
  const getStrength = (pass: string) => {
    let score = 0
    if (pass.length > 8) score += 20
    if (pass.match(/[A-Z]/)) score += 20
    if (pass.match(/[0-9]/)) score += 20
    if (pass.match(/[^A-Za-z0-9]/)) score += 20
    if (pass.length > 12) score += 20
    return score
  }

  const strength = getStrength(password)

  return (
    <Card className="border-2 border-orange-500 bg-orange-500/5 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-400"><Key className="h-5 w-5"/> Hash Analyzer</CardTitle>
        <CardDescription>Visualize how password complexity affects security.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
          type="text" 
          placeholder="Type a password..." 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="bg-black/50 border-slate-700" 
        />
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Entropy Score</span>
            <span>{strength}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${strength < 40 ? 'bg-red-500' : strength < 80 ? 'bg-yellow-500' : 'bg-green-500'}`} 
              style={{ width: `${strength}%` }} 
            />
          </div>
        </div>

        <div className="p-4 bg-black/50 rounded-lg font-mono text-xs text-slate-400 border border-slate-800">
          <div className="mb-2"><span className="text-orange-500">MD5 (Unsafe):</span> <span className="text-slate-500">{password ? btoa(password).split('').reverse().join('') + "8f9a" : "waiting..."}</span></div>
          <div><span className="text-emerald-500">Bcrypt (Safe):</span> <span className="text-slate-300">{password ? "$2a$12$" + btoa(password).substring(0,15) + "..." : "waiting..."}</span></div>
        </div>
      </CardContent>
    </Card>
  )
}

function TwoFactorLab() {
  const [step, setStep] = useState<"setup" | "verify" | "complete">("setup")
  const [code, setCode] = useState("")
  
  return (
    <Card className="border-2 border-emerald-500 bg-emerald-500/5 mb-8">
      <CardHeader><CardTitle className="text-emerald-400 flex gap-2"><Beaker className="h-5 w-5"/> 2FA Simulation</CardTitle></CardHeader>
      <CardContent>
        {step === "setup" && (
           <div className="text-center space-y-4">
             <div className="bg-white p-2 inline-block rounded-lg"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=OTPAUTH://totp/CyberScan:User?secret=JBSWY3DPEHPK3PXP`} alt="QR" /></div>
             <p className="text-sm text-slate-400">Scan this code with Google Authenticator.</p>
             <Button onClick={() => setStep("verify")} className="bg-emerald-600 hover:bg-emerald-700">I Scanned It</Button>
           </div>
        )}
        {step === "verify" && (
          <div className="space-y-4">
            <Input placeholder="Enter 6-digit Code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="bg-black/50 border-slate-700 text-center text-2xl tracking-widest font-mono" />
            <Button onClick={() => code.length === 6 && setStep("complete")} className="w-full bg-emerald-600 hover:bg-emerald-700">Verify Token</Button>
          </div>
        )}
        {step === "complete" && (
          <div className="text-center text-emerald-400 py-6"><CheckCircle2 className="h-16 w-16 mx-auto mb-4"/>Device Authorized Successfully!</div>
        )}
      </CardContent>
    </Card>
  )
}

function SQLInjectionLab() {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [status, setStatus] = useState<"idle" | "hacked" | "failed">("idle")

  const login = () => {
    const u = user.toLowerCase().trim()
    const validAttacks = ["' or '1'='1", "' or 1=1", "admin'--", "admin' #", "' or true--"]
    if (validAttacks.some(attack => u.includes(attack))) setStatus("hacked")
    else setStatus("failed")
  }

  return (
    <Card className="border-2 border-blue-500 bg-blue-500/5 mb-8">
      <CardHeader><CardTitle className="text-blue-400 flex gap-2"><Beaker className="h-5 w-5"/> SQL Injection Simulator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-black/50 p-4 rounded font-mono text-xs text-slate-400 border border-slate-800">
          <span className="text-purple-400">SELECT</span> * <span className="text-purple-400">FROM</span> users <span className="text-purple-400">WHERE</span> user = '<span className="text-white">{user}</span>' <span className="text-purple-400">AND</span> pass = '***'
        </div>
        <div className="grid gap-2">
          <Input placeholder="Username" value={user} onChange={e => setUser(e.target.value)} className="bg-black/50 border-slate-700"/>
          <Input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} className="bg-black/50 border-slate-700"/>
        </div>
        <Button onClick={login} className="w-full bg-blue-600 hover:bg-blue-700">Login</Button>
        {status === "hacked" && <div className="p-3 bg-green-500/20 text-green-400 rounded border border-green-500 flex items-center gap-2"><Lock className="h-4 w-4"/> ACCESS GRANTED: Admin Dashboard</div>}
        {status === "failed" && <div className="p-3 bg-red-500/20 text-red-400 rounded border border-red-500 flex items-center gap-2"><XCircle className="h-4 w-4"/> ACCESS DENIED</div>}
      </CardContent>
    </Card>
  )
}

// --- MAIN PAGE ---
export default function ArticlePage() {
  const params = useParams()
  const article = articleData[params.id as string]
  const [showLab, setShowLab] = useState(false)

  if (!article) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Content Not Found</div>

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-slate-200 relative overflow-hidden font-sans selection:bg-blue-500/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* BACK BUTTON */}
          <Button variant="ghost" asChild className="mb-6 text-slate-400 hover:text-white pl-0">
            <Link href="/learn"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Education Hub</Link>
          </Button>

          {/* HEADER CARD */}
          <Card className="mb-8 bg-[#0b0f17] border-slate-800 border-l-4 border-l-blue-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <CardHeader>
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{article.category}</Badge>
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">{article.difficulty}</Badge>
              </div>
              <CardTitle className="text-4xl font-black text-white mb-4 tracking-tight">{article.title}</CardTitle>
              <div className="flex items-center gap-6 text-slate-400 text-sm font-mono">
                <span className="flex items-center gap-2"><User className="h-4 w-4 text-blue-500"/> {article.author}</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500"/> {article.readTime}</span>
              </div>
              
              <div className="mt-6 flex gap-3 items-center">
                <Badge variant="secondary" className="bg-slate-800 text-slate-300 px-3 py-1.5 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500"/> Verified Content
                </Badge>
                
                {article.hasLab && (
                  <Button onClick={() => setShowLab(!showLab)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_0_15px_-3px_rgba(37,99,235,0.5)]">
                    <PlayCircle className="mr-2 h-4 w-4"/> {showLab ? "Close Lab" : "Launch Interactive Lab"}
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* DYNAMIC LAB RENDERING */}
          <motion.div animate={{ height: showLab ? "auto" : 0, opacity: showLab ? 1 : 0 }} className="overflow-hidden">
            {article.hasLab && showLab && (
              <div className="mb-8">
                {article.labType === "sql-injection" && <SQLInjectionLab />}
                {article.labType === "2fa-setup" && <TwoFactorLab />}
                {article.labType === "xss" && <XSSLab />}
                {article.labType === "password-crack" && <PasswordLab />}
                {article.labType === "command-injection" && <CommandInjectionLab />}
                {article.labType === "path-traversal" && <PathTraversalLab />}
              </div>
            )}
          </motion.div>

          {/* RICH CONTENT READER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-[#0b0f17] border-slate-800 shadow-xl">
                <CardContent className="p-8 lg:p-10">
                  {article.content.map((block, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="mb-6">
                      {block.type === "visualization" && <AttackVisualization type={block.visType || ""} />}
                      {block.type === "paragraph" && <p className="text-lg leading-8 text-slate-300">{block.text}</p>}
                      {block.type === "header" && <h3 className="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2"><ChevronRight className="text-blue-500 h-6 w-6"/>{block.text}</h3>}
                      {block.type === "code" && <div className="bg-black border border-slate-800 rounded-lg p-4 font-mono text-sm text-emerald-400 overflow-x-auto shadow-inner relative group"><div className="absolute top-2 right-2 text-slate-600 text-xs uppercase tracking-widest">Payload</div>{block.text}</div>}
                      {block.type === "hint" && <div className="bg-blue-500/5 border-l-4 border-blue-500 p-4 rounded-r-lg my-6"><h4 className="text-blue-400 font-bold flex items-center gap-2 mb-1"><Lightbulb className="h-4 w-4"/> {block.title}</h4><p className="text-slate-400 text-sm">{block.text}</p></div>}
                      {block.type === "list" && <ul className="list-disc pl-6 space-y-2 text-slate-300 marker:text-blue-500">{block.items?.map((item, idx) => <li key={idx}>{item}</li>)}</ul>}
                      {block.type === "alert" && <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4 flex gap-4 items-start"><ShieldAlert className="h-6 w-6 text-red-500 shrink-0 mt-1"/><div><h4 className="text-red-400 font-bold mb-1">{block.title}</h4><p className="text-slate-400 text-sm">{block.text}</p></div></div>}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar (Only shows if there is a lab) */}
            <div className="hidden lg:block">
              <div className="sticky top-8 space-y-6">
                <Card className="bg-[#0b0f17] border-slate-800">
                  <CardHeader><CardTitle className="text-white text-lg">Module Summary</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {article.content.filter(b => b.type === "header").map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-400 text-sm hover:text-blue-400 cursor-pointer transition-colors">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                          {h.text}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {article.hasLab && (
                  <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-slate-800 border-t-2 border-t-blue-500">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-white mb-2">Ready to practice?</h4>
                      <p className="text-sm text-slate-400 mb-4">Apply what you've learned in the interactive lab environment.</p>
                      <Button onClick={() => setShowLab(true)} className="w-full bg-white text-black hover:bg-slate-200">Open Lab</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AuthGuard>
  )
}