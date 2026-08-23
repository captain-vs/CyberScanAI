"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Layers, ArrowLeft, Globe, Server, RefreshCw, Cpu, ShieldAlert, Terminal, Zap, Laptop, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CyberWrapper } from "@/components/cyber-wrapper"
import AuthGuard from "@/components/auth-guard"

// --- DETAILED OSI ENCAPSULATION & SECURITY VULNERABILITY DATA ---
const OSI_LAYERS_DATA = [
  { 
    level: 7, 
    name: "Application Layer", 
    header: "HTTP / DNS / SMTP Payload", 
    color: "text-blue-400 border-blue-500/40 bg-blue-950/20",
    func: "Provides network services directly to end users and handles software protocol requests.",
    scenario: "You type 'securityx.in' into your browser dashboard requesting data.",
    threats: ["SQL Injection", "Cross-Site Scripting (XSS)", "DDoS attacks"],
    protocols: "HTTP (80), HTTPS (443), DNS (53), FTP (20/21)"
  },
  { 
    level: 6, 
    name: "Presentation Layer", 
    header: "PH (Presentation Header / SSL)", 
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/20",
    func: "Translates, compresses, encodes, and encrypts data (SSL/TLS) for application readability.",
    scenario: "Data is encrypted and compressed into a secure TLS session channel.",
    threats: ["Character Encoding Attacks", "SSL Stripping", "Data Compression Manipulation"],
    protocols: "TLS, SSL, JPEG, ASCII"
  },
  { 
    level: 5, 
    name: "Session Layer", 
    header: "Session ID & Dialog Sockets", 
    color: "text-teal-400 border-teal-500/40 bg-teal-950/20",
    func: "Establishes, maintains, and tears down communication dialogs between hosts via sockets.",
    scenario: "A continuous secure socket connection dialog is opened between client and server.",
    threats: ["Session Replay", "Session Fixation", "Man-in-the-Middle (MitM)"],
    protocols: "NetBIOS, PPTP, RPC, Sockets"
  },
  { 
    level: 4, 
    name: "Transport Layer", 
    header: "TCP Header (Source/Dest Ports)", 
    color: "text-lime-400 border-lime-500/40 bg-lime-950/20",
    func: "Guarantees end-to-end reliable delivery, flow control, and port-based segmentation.",
    scenario: "Data is split into segments, attaching TCP or UDP header ports.",
    threats: ["SYN Flood", "UDP Flood", "Port Scanning"],
    protocols: "TCP, UDP"
  },
  { 
    level: 3, 
    name: "Network Layer", 
    header: "IP Header (Logical IP Addr)", 
    color: "text-amber-400 border-amber-500/40 bg-amber-950/20",
    func: "Handles logical addressing and cross-network packet routing across global routers.",
    scenario: "Routers wrap packets with Source & Destination IP addresses.",
    threats: ["IP Spoofing", "Route Table Manipulation", "Smurf Attack"],
    protocols: "IPv4, IPv6, ICMP, IPsec"
  },
  { 
    level: 2, 
    name: "Data Link Layer", 
    header: "MAC Header (Physical Frames)", 
    color: "text-orange-400 border-orange-500/40 bg-orange-950/20",
    func: "Provides node-to-node physical framing, error detection, and hardware MAC addresses.",
    scenario: "Packets are packaged into frames for your local network interface card (NIC).",
    threats: ["MAC Address Spoofing", "ARP Spoofing", "Switch Flooding"],
    protocols: "Ethernet (802.3), Wi-Fi, PPP, MAC"
  },
  { 
    level: 1, 
    name: "Physical Layer", 
    header: "101101011001010 (Binary Bitstream)", 
    color: "text-red-400 border-red-500/40 bg-red-950/20",
    func: "Transmits raw binary bits over a physical medium (copper cables, fiber optics, or radio waves).",
    scenario: "Voltage pulses and light signals move across physical cables to Device B.",
    threats: ["Eavesdropping / Tapping", "Physical Tampering", "Electromagnetic Interference"],
    protocols: "Fiber, Copper Cables, Hubs, Repeaters"
  },
]

const TCP_IP_STACK = [
  { name: "Application Layer", osiCover: "OSI Layers 5, 6, & 7", desc: "Handles high-level user applications, formatting, and session control." },
  { name: "Transport Layer", osiCover: "OSI Layer 4 (TCP/UDP)", desc: "Guarantees end-to-end reliable delivery, sequencing, and error correction." },
  { name: "Internet Layer", osiCover: "OSI Layer 3 (IP)", desc: "Handles logical packet routing and cross-network communication." },
  { name: "Network Access Layer", osiCover: "OSI Layers 1 & 2", desc: "Manages hardware framing, MAC addressing, and physical media transmission." },
]

// --- HIGH-YIELD EXAM & INTERVIEW QUESTIONS & PORTS ---
const TOP_PORT_CHEAT_SHEET = [
  { service: "FTP (File Transfer)", port: "20 / 21", layer: "Layer 7", proto: "TCP" },
  { service: "SSH (Secure Shell)", port: "22", layer: "Layer 7", proto: "TCP" },
  { service: "DNS (Domain Name System)", port: "53", layer: "Layer 7", proto: "TCP / UDP" },
  { service: "HTTP (Web Traffic)", port: "80", layer: "Layer 7", proto: "TCP" },
  { service: "HTTPS (Secure Web)", port: "443", layer: "Layer 7", proto: "TCP" },
  { service: "RDP (Remote Desktop)", port: "3389", layer: "Layer 7", proto: "TCP / UDP" },
]

const FREQUENT_INTERVIEW_QS = [
  { 
    q: "What is the primary difference between TCP and UDP at Layer 4?", 
    a: "TCP is connection-oriented, guarantees delivery using a 3-way handshake, and handles error recovery. UDP is connectionless, faster, and unreliably transmits packets without acknowledgment (used for streaming/DNS)." 
  },
  { 
    q: "At which OSI layer do Routers vs. Switches operate?", 
    a: "Routers operate at Layer 3 (Network Layer) using IP addresses to route packets between distinct networks. Switches operate at Layer 2 (Data Link Layer) using MAC addresses to forward frames within a local network." 
  },
  { 
    q: "What is encapsulation and de-encapsulation?", 
    a: "Encapsulation is the process where data moving down the sender's OSI stack gets wrapped with specific protocol headers at each layer. De-encapsulation is the exact reverse process on the receiving end where headers are unpacked." 
  },
  { 
    q: "What is the 3-way handshake in TCP?", 
    a: "It's the mechanism used to establish a reliable connection: 1. SYN (Client requests connection), 2. SYN-ACK (Server acknowledges), 3. ACK (Client acknowledges server response)." 
  }
]

export default function OsiUltimateLabPage() {
  const [activeLayer, setActiveLayer] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setActiveLayer((prev) => (prev < OSI_LAYERS_DATA.length - 1 ? prev + 1 : 0))
      }, 1600)
    }
    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const current = OSI_LAYERS_DATA[activeLayer]

  return (
    <AuthGuard>
      <CyberWrapper>
        <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
          
          {/* TOP BREADCRUMB */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-lime-400 text-slate-400">
              <Link href="/learn" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Education Hub
              </Link>
            </Button>
            <span className="text-xs font-mono px-3 py-1 rounded bg-lime-500/10 border border-lime-500/30 text-lime-400">
              Module 1 Lab: Network Encapsulation & Threat Vectors
            </span>
          </div>

          {/* PAGE HEADER */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              OSI Model <span className="text-lime-400">Network Flow & Encapsulation Matrix</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Inspect how data flows from Device A down through all 7 encapsulation layers, appending protocol headers and converting to binary bits before reaching Device B.
            </p>
          </div>

          {/* SECTION 1: LIVE ENCAPSULATION MATRIX */}
          <div className="relative bg-[#0a0f18] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Laptop className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-mono text-white">Device A (Sender)</span>
                </div>
                <span className="text-xs font-mono text-slate-500 hidden md:inline">➔ Encapsulation Down ➔</span>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Laptop className="h-4 w-4 text-lime-400" />
                  <span className="text-xs font-mono text-white">Device B (Receiver)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`font-bold gap-2 text-xs ${isAutoPlaying ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-lime-500 hover:bg-lime-400 text-black'}`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isAutoPlaying ? 'animate-spin' : ''}`} />
                  {isAutoPlaying ? 'Pause Flow' : 'Auto-Play Encapsulation'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveLayer((prev) => (prev < OSI_LAYERS_DATA.length - 1 ? prev + 1 : 0))}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  Next Layer Down ↓
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-2">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2">
                  Select Layer (7 Top ➔ 1 Bottom)
                </span>
                {OSI_LAYERS_DATA.map((layer, idx) => {
                  const isActive = activeLayer === idx
                  return (
                    <div
                      key={layer.level}
                      onClick={() => { setActiveLayer(idx); setIsAutoPlaying(false); }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isActive 
                          ? 'bg-lime-500/20 border-lime-400 text-white shadow-[0_0_20px_rgba(132,204,22,0.25)] scale-[1.01]' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          isActive ? 'bg-lime-500 text-black' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {layer.level}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-white">{layer.name}</h4>
                          <span className="text-[11px] font-mono text-cyan-400">{layer.header}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">L{layer.level}</span>
                    </div>
                  )
                })}
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-lime-400 uppercase tracking-widest">[ Live Packet Assembly State ]</span>
                    <span className="text-xs font-mono text-slate-500">Progress: Layer {current.level} / 7</span>
                  </div>

                  <div className="bg-black/80 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2 overflow-x-auto min-h-[85px]">
                    {OSI_LAYERS_DATA.slice(0, activeLayer + 1).reverse().map((l, i) => (
                      <div key={i} className={`px-3 py-2 rounded-lg border text-xs font-mono font-semibold animate-fadeIn ${l.color}`}>
                        {l.header}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 italic">Each descending layer wraps the payload with its specific protocol header wrapper.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{current.name}</h3>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Protocols: {current.protocols}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Core Function</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{current.func}</p>
                    </div>
                    <div className="bg-lime-950/20 p-4 rounded-lg border border-lime-500/20 space-y-1">
                      <span className="text-[10px] text-lime-400 uppercase font-mono">Real-World Scenario</span>
                      <p className="text-xs text-lime-200 leading-relaxed">{current.scenario}</p>
                    </div>
                  </div>

                  <div className="bg-red-950/20 p-4 rounded-lg border border-red-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs font-mono">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Associated Layer Vulnerabilities & Attacks:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {current.threats.map((threat, idx) => (
                        <span key={idx} className="text-xs font-mono bg-red-950/40 border border-red-500/30 text-red-300 px-2.5 py-1 rounded">• {threat}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: OSI VS TCP/IP COMPARISON */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">OSI Model vs. TCP/IP Operational Suite</h2>
              <p className="text-sm text-slate-400 mt-1">Comparing 7 theoretical OSI layers with the 4 practical operational layers of the modern internet.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-white font-bold border-b border-slate-800 pb-3">
                  <Layers className="h-5 w-5 text-blue-400" />
                  <h3>OSI Conceptual Framework (7 Layers)</h3>
                </div>
                <div className="space-y-2">
                  {OSI_LAYERS_DATA.map((l) => (
                    <div key={l.level} className="flex items-center justify-between text-xs bg-black/40 p-2.5 rounded border border-slate-800 font-mono">
                      <span className="text-slate-300">L{l.level} — {l.name}</span>
                      <span className="text-cyan-400 text-[11px]">{l.header.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-white font-bold border-b border-slate-800 pb-3">
                  <Server className="h-5 w-5 text-lime-400" />
                  <h3>TCP/IP Operational Suite (4 Layers)</h3>
                </div>
                <div className="space-y-3">
                  {TCP_IP_STACK.map((t, idx) => (
                    <div key={idx} className="bg-black/60 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{t.name}</span>
                        <span className="text-[10px] text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20 font-mono">{t.osiCover}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: HIGH-YIELD PORT CHEAT SHEET & INTERVIEW Q&A */}
          <div className="space-y-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <HelpCircle className="h-6 w-6 text-lime-400" />
              <div>
                <h2 className="text-xl font-bold text-white">High-Yield Exam Port Cheat-Sheet & Interview Q&A</h2>
                <p className="text-xs text-slate-400">Essential networking questions frequently asked in security interviews and certifications.</p>
              </div>
            </div>

            {/* Port Grid Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono text-lime-400 uppercase tracking-widest">[ Critical Network Ports ]</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TOP_PORT_CHEAT_SHEET.map((p, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white font-mono">{p.service.split(" ")[0]}</span>
                      <span className="text-xs font-mono text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20">Port {p.port}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{p.service} ({p.proto})</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Q&A Accordion/Grid */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest">[ Top Interview & Exam Questions ]</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {FREQUENT_INTERVIEW_QS.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-white flex items-start gap-2">
                      <span className="text-lime-400 font-mono">Q{idx+1}:</span> {item.q}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed pl-5 border-l-2 border-lime-500/30">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER NAVIGATION */}
          <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
            <Link href="/learn">
              <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800">
                ← Return to Education Hub
              </Button>
            </Link>
            <Link href="/gamezone">
              <Button className="bg-lime-500 hover:bg-lime-400 text-black font-bold">
                Proceed to Gamezone →
              </Button>
            </Link>
          </div>

        </div>
      </CyberWrapper>
    </AuthGuard>
  )
}