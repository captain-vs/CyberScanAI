"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link" // ⚡ Import Link for navigation
import {
  Globe, FileCheck, Search, ImageIcon, Shield, Hash, Activity,
  Download, Terminal as TerminalIcon, AlertTriangle, CheckCircle2, XCircle, Cpu,
  Map, ChevronRight, Ghost, Eye, Check, Copy, Bug, Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScanTerminal, type LogEntry } from "@/components/scan-terminal"
import AuthGuard from "@/components/auth-guard"
import { recordActivity } from "@/lib/activity"

// --- DATASETS FOR SAMPLES ---
const PHISHING_URLS = [
  "br-icloud.com.br",
  "signin.eby.de.zukruygxctzmmqi.civpro.co.za",
  "http://www.marketingbyinternet.com/mo/e56508df639f6ce7d55c81ee3fcd5ba8",
  "https://docs.google.com/spreadsheet/viewform?formkey=dGg2Z1lCUHlSdjllTVNRUW50TFIzSkE6MQ",
  "retajconsultancy.com" 
]

const SAFE_URLS = [
  "https://www.google.com",
  "https://www.brave.com",
  "https://www.amazon.in",
  "https://www.flipkart.com/",
  "https://www.youtube.com/"
]

const SUSPICIOUS_URLS = [
  "http://crypto-giveaway-free.xyz",
  "http://www.pashminaonline.com/pure-pashminas",
  "http://www.ikenmijnkunst.nl/index.php/exposities/exposities-2006",
  "http://www.szabadmunkaero.hu/cimoldal.html?start=12",
  "http://larcadelcarnevale.com/catalogo/palloncini"
]

// --- TYPES ---
type ScanResult = {
  target: string
  type: string
  status: "Clean" | "Warning" | "Malicious"
  description: string
  scannedOn: string
  analysis: {
    ipAddress?: string
    hostname?: string
    country?: string
    sslCertificate?: string
    details: { label: string; value: string }[]
    requestHeaders?: { header: string; value: string }[]
    responseHeaders?: { header: string; value: string }[]
  }
  aiDetection?: {
    isAiGenerated: boolean
    confidenceScore: number
    reasoning: string
  }
  threat: {
    explanation: string
    recommendations: string
  }
  vendors: { name: string; result: string }[]
}

function ScanContent() {
  const [activeTab, setActiveTab] = useState("url")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Input State for Auto-Fill
  const [urlInput, setUrlInput] = useState("")
  const [ipInput, setIpInput] = useState("")

  // Hash State
  const [hashInput, setHashInput] = useState("")
  const [hashType, setHashType] = useState("base64")
  const [hashOutput, setHashOutput] = useState("")
  const [hashMode, setHashMode] = useState<"encode" | "decode">("encode")
  const [copied, setCopied] = useState(false)

  const addLog = (type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs(prev => [...prev, { timestamp, type, message }])
  }

  // 📸 Image Compression Helper
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.onerror = (error) => reject(error)
      }
    })
  }

  // --- SCAN FUNCTION ---
  const performScan = async (target: string, type: "URL" | "IP" | "File" | "Image", fileObject?: File) => {
    setLoading(true)
    setProgress(0)
    setResult(null)
    setLogs([])
    
    addLog("info", `Initializing ${type} scan module...`)
    addLog("info", `Target acquired: ${target}`)

    const steps = ["Resolving details...", "Checking signatures...", "Querying threat DB...", "Running AI heuristics..."]
    let stepIndex = 0

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90
        if (prev % 20 === 0 && stepIndex < steps.length) {
          addLog("info", steps[stepIndex])
          stepIndex++
        }
        return prev + 5
      })
    }, 200)

    try {
      addLog("info", "Connecting to AI Backend...")

      let bodyPayload: any = { target, type }

      if (type === "Image" && fileObject) {
        addLog("info", "Compressing image for Vision Analysis...")
        try {
          const base64 = await compressImage(fileObject)
          bodyPayload.imageBase64 = base64
        } catch (e) {
          throw new Error("Failed to process image file.")
        }
      }
      
      const res = await fetch("/api/scan/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      })
      
      if (!res.ok) {
         const errText = await res.text().catch(() => res.statusText)
         throw new Error(`API Error: ${errText.substring(0, 50)}...`)
      }

      const data = await res.json()
      
      clearInterval(interval)
      setProgress(100)

      if (data.status === "Malicious") addLog("error", "THREAT DETECTED! Signature match.")
      else if (data.status === "Warning") addLog("warning", "Suspicious patterns identified.")
      else addLog("success", "Scan complete. No threats found.")

      const fullResult: ScanResult = {
        target,
        type,
        status: data.status || "Warning",
        description: data.description || "Analysis completed.",
        scannedOn: new Date().toLocaleString(),
        analysis: {
          ipAddress: data.analysis?.ipAddress,
          hostname: data.analysis?.hostname,
          country: data.analysis?.country,
          sslCertificate: data.analysis?.sslCertificate,
          details: data.analysis?.details || [],
          requestHeaders: data.analysis?.requestHeaders || [],
          responseHeaders: data.analysis?.responseHeaders || []
        },
        aiDetection: data.aiDetection,
        threat: {
          explanation: data.threat?.explanation || data.threatExplanation || "No details provided.",
          recommendations: data.threat?.recommendations || data.recommendations || "Manual check recommended."
        },
        vendors: data.vendors || []
      }

      await recordActivity({ type: "scan", description: `${type} Scan: ${target}`, points: 20 })
      setResult(fullResult)

    } catch (err: any) {
      console.error(err)
      clearInterval(interval)
      addLog("error", `CRITICAL FAILURE: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLERS ---
  const handleScan = (e: React.FormEvent<HTMLFormElement>, type: "URL" | "IP" | "File" | "Image") => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    if (type === "Image") {
      const file = formData.get("file") as File
      if (file.name) performScan(file.name, "Image", file)
    } else if (type === "File") {
      const file = formData.get("file") as File
      if (file.name) performScan(file.name, "File")
    } else {
      const val = formData.get("input") as string
      if (val) performScan(val, type)
    }
  }

  // 🔥 UPDATED: SAMPLE RANDOMIZER LOGIC
  const fillSample = (type: "URL" | "IP", category: "Phishing" | "Safe" | "Suspicious") => {
    if (type === "URL") {
       let randomUrl = "";
       if (category === "Phishing") randomUrl = PHISHING_URLS[Math.floor(Math.random() * PHISHING_URLS.length)];
       else if (category === "Safe") randomUrl = SAFE_URLS[Math.floor(Math.random() * SAFE_URLS.length)];
       else if (category === "Suspicious") randomUrl = SUSPICIOUS_URLS[Math.floor(Math.random() * SUSPICIOUS_URLS.length)];
       
       setUrlInput(randomUrl);
    }
    // Simple IP samples for now
    if (type === "IP") {
      if (category === "Phishing") setIpInput("185.220.101.44"); // Tor Exit
      else setIpInput("8.8.8.8"); // Google
    }
  }

  // Helper to format result into a readable TXT string
  const formatResultToTxt = (res: ScanResult) => {
    let txt = `CYBERSCAN REPORT\n`
    txt += `================\n`
    txt += `Target: ${res.target}\n`
    txt += `Type: ${res.type}\n`
    txt += `Status: ${res.status}\n`
    txt += `Date: ${res.scannedOn}\n`
    txt += `Summary: ${res.description}\n\n`
    if (res.aiDetection) {
      txt += `AI GENERATION ANALYSIS\n`
      txt += `----------------------\n`
      txt += `Is AI Generated: ${res.aiDetection.isAiGenerated}\n`
      txt += `Confidence: ${res.aiDetection.confidenceScore}%\n`
      txt += `Reasoning: ${res.aiDetection.reasoning}\n\n`
    }
    txt += `THREAT ANALYSIS\n`
    txt += `---------------\n`
    txt += `Explanation: ${res.threat.explanation}\n\n`
    txt += `Recommendations: ${res.threat.recommendations}\n\n`
    
    if (res.analysis.ipAddress) txt += `IP: ${res.analysis.ipAddress}\n`
    
    return txt
  }

  const handleDownload = () => {
    if (!result) return
    const element = document.createElement("a")
    const txtData = formatResultToTxt(result)
    const file = new Blob([txtData], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `cyberscan_report_${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    addLog("success", "Report downloaded successfully (TXT format).")
  }

  // --- HASH LOGIC ---
  const handleHashGeneration = () => {
    if (!hashInput.trim()) return
    try {
      if (hashMode === "encode") {
        if (hashType === "base64") setHashOutput(btoa(hashInput))
        else setHashOutput(`${hashType.toUpperCase()}_${hashInput.split('').reverse().join('')}_SIMULATED_HASH`)
      } else {
         if (hashType === "base64") try { setHashOutput(atob(hashInput)) } catch { setHashOutput("Error: Invalid Base64") }
         else setHashOutput("Decoding supported for Base64 only.")
      }
      addLog("success", `Hash operation (${hashMode}) successful.`)
    } catch { addLog("error", "Hash processing failed.") }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Clean": return "from-emerald-500/20 to-emerald-900/10 border-emerald-500/50 text-emerald-400"
      case "Malicious": return "from-red-500/20 to-red-900/10 border-red-500/50 text-red-400"
      default: return "from-amber-500/20 to-amber-900/10 border-amber-500/50 text-amber-400"
    }
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 relative overflow-hidden font-sans selection:bg-blue-500/30 pb-20">
      
      {/* BACKGROUND FX */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="container max-w-6xl mx-auto px-4 py-12 relative z-10">
        
        {/* 🔥 UPDATED HEADER LAYOUT */}
        <div className="flex flex-col items-center mb-8 relative">
           {/* 1. CENTERED TITLE */}
           <div className="text-center mb-6">
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                CYBER<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">SCAN</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Next-Gen Threat Intelligence Platform. Powered by AI.
              </p>
           </div>
           
           {/* 2. RIGHT-ALIGNED ROADMAP BUTTON (BELOW TITLE) */}
           <div className="w-full flex justify-end px-4">
               <Link href="/roadmap">
                  <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700 rounded-full text-slate-300 hover:text-white hover:border-blue-500 transition-all shadow-lg"
                  >
                      <Map className="h-5 w-5 text-blue-500" />
                      <span className="font-bold text-sm">Learning Roadmap</span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                  </motion.button>
               </Link>
           </div>
        </div>

        {/* MAIN INTERFACE */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Tabs defaultValue="url" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto bg-slate-900/80 border border-slate-800 p-1 mb-8">
              {[
                { id: "url", icon: Globe, label: "URL" },
                { id: "file", icon: FileCheck, label: "File" },
                { id: "ip", icon: Search, label: "IP" },
                { id: "image", icon: ImageIcon, label: "Img" },
                { id: "hash", icon: Hash, label: "Hash" },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex flex-col md:flex-row gap-2 items-center"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-xs md:text-sm">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* INPUT MODULES */}
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm shadow-xl relative overflow-hidden">
              <div className="mb-6 flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-sm">
                <TerminalIcon className="h-4 w-4" /> 
                {activeTab} Input Module
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  {activeTab === "url" && (
                    <div className="space-y-4">
                      <form onSubmit={(e) => handleScan(e, "URL")}>
                        <Input 
                           name="input" 
                           placeholder="https://malicious-site.com" 
                           className="bg-black/50 border-slate-700 h-12" 
                           required 
                           disabled={loading}
                           value={urlInput}
                           onChange={(e) => setUrlInput(e.target.value)}
                        />
                        <Button className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 font-bold" disabled={loading}>
                          {loading ? <Activity className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                          INITIATE URL SCAN
                        </Button>
                      </form>
                      
                      {/* 🔥 UPDATED SAMPLE CHIPS */}
                      <div className="pt-2 flex flex-wrap gap-2 items-center">
                         <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mr-2">Try Random Samples:</span>
                         <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-colors py-1.5"
                            onClick={() => fillSample("URL", "Phishing")}
                         >
                            🔴 Phishing
                         </Badge>
                         <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400 transition-colors py-1.5"
                            onClick={() => fillSample("URL", "Safe")}
                         >
                            🟢 Safe Site
                         </Badge>
                         <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-400 transition-colors py-1.5"
                            onClick={() => fillSample("URL", "Suspicious")}
                         >
                            🟠 Suspicious
                         </Badge>
                      </div>
                    </div>
                  )}

                  {activeTab === "file" && (
                    <form onSubmit={(e) => handleScan(e, "File")} className="space-y-4">
                      <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-blue-500/50 cursor-pointer transition-colors bg-black/20">
                        <Input name="file" type="file" className="hidden" id="file" required disabled={loading} />
                        <label htmlFor="file" className="cursor-pointer block">
                          <Download className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                          <span className="text-sm text-slate-400">Drop malware sample</span>
                        </label>
                      </div>
                      <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold" disabled={loading}>
                        {loading ? <Activity className="mr-2 h-4 w-4 animate-spin" /> : <Bug className="mr-2 h-4 w-4" />}
                        UPLOAD & ANALYZE
                      </Button>
                      <p className="text-xs text-slate-500 text-center mt-2">
                        For testing, download the <a href="https://secure.eicar.org/eicar.com" target="_blank" className="text-blue-400 underline">EICAR Test File</a> (Safe Virus).
                      </p>
                    </form>
                  )}

                  {activeTab === "ip" && (
                     <div className="space-y-4">
                        <form onSubmit={(e) => handleScan(e, "IP")}>
                          <Input 
                             name="input" 
                             placeholder="192.168.x.x" 
                             className="bg-black/50 border-slate-700 h-12" 
                             required 
                             disabled={loading}
                             value={ipInput}
                             onChange={(e) => setIpInput(e.target.value)} 
                          />
                          <Button className="w-full h-12 mt-4 bg-purple-600 hover:bg-purple-700 font-bold" disabled={loading}>
                            {loading ? <Activity className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            TRACEROUTE & SCAN
                          </Button>
                        </form>
                        <div className="pt-2 flex flex-wrap gap-2 items-center">
                           <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mr-2">Try Samples:</span>
                           <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-colors py-1.5"
                              onClick={() => fillSample("IP", "Phishing")}
                           >
                              🔴 Tor Exit Node
                           </Badge>
                           <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400 transition-colors py-1.5"
                              onClick={() => fillSample("IP", "Safe")}
                           >
                              🟢 Google DNS
                           </Badge>
                        </div>
                     </div>
                  )}

                  {activeTab === "image" && (
                    <form onSubmit={(e) => handleScan(e, "Image")} className="space-y-4">
                      <Input name="file" type="file" accept="image/*" className="bg-black/50 border-slate-700" required disabled={loading} />
                      <Button className="w-full h-12 bg-pink-600 hover:bg-pink-700 font-bold" disabled={loading}>
                        {loading ? <Activity className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                        STEGANOGRAPHY & AI CHECK
                      </Button>
                    </form>
                  )}

                  {activeTab === "hash" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Select value={hashMode} onValueChange={(v: any) => setHashMode(v)}>
                          <SelectTrigger className="bg-black/50 border-slate-700 h-12"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="encode">Encode</SelectItem><SelectItem value="decode">Decode</SelectItem></SelectContent>
                        </Select>
                        <Select value={hashType} onValueChange={setHashType}>
                          <SelectTrigger className="bg-black/50 border-slate-700 h-12"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="base64">Base64</SelectItem><SelectItem value="sha256">SHA-256</SelectItem><SelectItem value="md5">MD5</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <Textarea value={hashInput} onChange={(e) => setHashInput(e.target.value)} placeholder="Input text..." className="bg-black/50 border-slate-700 font-mono" />
                      <Button onClick={handleHashGeneration} className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-bold">
                        <Cpu className="mr-2 h-4 w-4" /> PROCESS HASH
                      </Button>
                      {hashOutput && (
                        <div className="p-4 bg-black/50 border border-slate-800 rounded font-mono text-green-400 text-sm break-all relative group">
                          {hashOutput}
                          <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-slate-500 hover:text-white" onClick={() => { navigator.clipboard.writeText(hashOutput); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                             {copied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>

          {/* RESULTS AREA */}
          <AnimatePresence mode="wait">
            
            {/* LOADING STATE */}
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20"
              >
                <div className="w-full max-w-md space-y-4 text-center">
                  <Activity className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
                  <h3 className="text-xl font-bold text-white">ANALYZING TARGET</h3>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-blue-500" animate={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-slate-400 font-mono text-sm">{progress}% Complete</p>
                </div>
              </motion.div>
            )}

            {/* RESULTS DISPLAY */}
            {!loading && result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* 1. STATUS BANNER */}
                <div className={`p-6 rounded-xl border bg-gradient-to-r ${getStatusColor(result.status)} relative overflow-hidden`}>
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-3">
                        {result.target}
                        <Badge variant={result.status === "Clean" ? "default" : "destructive"} className="text-base px-3 py-1">
                          {result.status}
                        </Badge>
                      </h2>
                        <p className="text-lg font-medium opacity-90">{result.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="bg-black/20 border-white/20 hover:bg-white/10 text-white shrink-0">
                      <Download className="mr-2 h-4 w-4" /> Download Report
                    </Button>
                  </div>
                    <div className="mt-4 flex items-center gap-2 text-sm opacity-70">
                       <Clock className="h-4 w-4" /> Scanned on: {result.scannedOn}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* AI IMAGE DETECTION CARD */}
                  {result.aiDetection && (
                    <Card className="bg-[#0b0f17] border-slate-800 shadow-lg md:col-span-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-purple-600" />
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-pink-500" /> 
                          AI Generation Analysis
                          {result.aiDetection.isAiGenerated && <Badge variant="destructive" className="ml-2">AI DETECTED</Badge>}
                        </CardTitle>
                        <CardDescription>Probability of synthetic/AI-generated origin.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Confidence Score</span>
                            <span className={`font-mono font-bold ${result.aiDetection.confidenceScore > 50 ? "text-pink-500" : "text-emerald-500"}`}>
                              {result.aiDetection.confidenceScore}%
                            </span>
                          </div>
                          <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.aiDetection.confidenceScore}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full ${
                                result.aiDetection.confidenceScore > 80 ? "bg-gradient-to-r from-red-500 to-pink-600" :
                                result.aiDetection.confidenceScore > 50 ? "bg-gradient-to-r from-orange-500 to-yellow-500" :
                                "bg-gradient-to-r from-emerald-500 to-blue-500"
                              }`}
                            />
                          </div>
                          <div className="p-3 bg-slate-900/50 rounded border border-slate-800 text-sm text-slate-300">
                            <strong>Reasoning:</strong> {result.aiDetection.reasoning}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* THREAT EXPLANATION */}
                  <Card className="bg-[#0b0f17] border-slate-800 shadow-lg md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white flex items-center gap-2"><Ghost className="h-5 w-5 text-purple-500"/> Threat Explanation & Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <p className="text-slate-300 leading-relaxed">{result.threat.explanation}</p>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2"><Shield className="h-5 w-5 text-blue-400"/> Recommended Actions</h4>
                        <p className="text-slate-300">{result.threat.recommendations}</p>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </motion.div>
            )}

            {/* SYSTEM READY PLACEHOLDER */}
            {!loading && !result && activeTab !== "hash" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[250px] flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                <Shield className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">System Ready</p>
                <p className="text-sm">Select a module to begin threat analysis.</p>
              </motion.div>
            )}

          </AnimatePresence>

          {/* SYSTEM CONSOLE */}
          <div className="mt-8">
            <ScanTerminal logs={logs} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default function ScanPage() {
  return <AuthGuard><ScanContent /></AuthGuard>
}