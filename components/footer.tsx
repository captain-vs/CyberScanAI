"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Github, Twitter, Linkedin, Heart, Download, Smartphone } from "lucide-react"
import { Button } from "react-day-picker"

export default function Footer() {
  const pathname = usePathname()

  // 🚫 Hide footer on auth pages
  if (pathname.startsWith("/auth")) {
    return null
  }

  return (
    <footer className="relative border-t border-slate-800 bg-black text-slate-400 overflow-hidden">
      
      {/* 1. CYBER GRID BACKGROUND TEXTURE */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 py-12">
        <div className="grid gap-12 md:grid-cols-4 lg:gap-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-white transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-500/10 border border-lime-500/50">
                <Shield className="h-4 w-4 text-lime-400" />
              </div>
              <span className="text-xl tracking-tight font-bold">Security<span className="text-lime-400">X</span></span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Advanced threat detection and cybersecurity education platform. 
              Secure your digital footprint with next-gen scanning tools.
            </p>
            <p className="text-xs text-slate-500 pt-2">
              System Status: <span className="text-lime-500 font-medium">● Operational</span>
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/scan" className="transition-colors hover:text-lime-400">Scanning Hub</Link>
              </li>
              <li>
                <Link href="/learn" className="transition-colors hover:text-lime-400">Education Hub</Link>
              </li>
              <li>
                <Link href="/gamezone" className="transition-colors hover:text-lime-400">GameZone</Link>
              </li>
              <li>
                <Link href="/osint" className="transition-colors hover:text-lime-400">OSINT Tools</Link>
              </li>
              <li>
                <Link href="/directory" className="text-lime-400 hover:text-lime-300 font-bold transition-colors flex items-center gap-1 mt-4">
                  Platform Directory →
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Roadmap */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/roadmap" className="transition-colors hover:text-lime-400">Cyber Roadmap</Link>
              </li>
              <li>
                <Link href="/gamezone" className="transition-colors hover:text-lime-400">Leaderboard</Link>
              </li>
              <li>
                <Link href="/profile" className="transition-colors hover:text-lime-400">User Profile</Link>
              </li>
            </ul>
          </div>

          {/* Support & Get the App */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Support</h3>
            <ul className="space-y-2.5 text-sm mb-6">
              <li>
                <Link href="/support" className="transition-colors hover:text-lime-400">Help Center & FAQs</Link>
              </li>
              <li>
                <Link href="/support" className="transition-colors hover:text-lime-400">Send Feedback</Link>
              </li>
              <li>
                <a href="mailto:customercare@securityx.in" className="transition-colors hover:text-lime-400 font-mono text-xs">
                  customercare@securityx.in
                </a>
              </li>
            </ul>

            <h3 className="text-white font-bold mb-1">Get the App</h3>
            <p className="text-xs text-slate-400 mb-3">SecurityX Mobile Companion.</p>
          
            <a href="https://apps.microsoft.com/detail/9MTN8V2PV8D0" target="_blank" rel="noreferrer">
    <Button className="rounded-lg bg-slate-800 hover:bg-lime-500 text-white hover:text-black font-bold flex items-center gap-2 px-4 py-2 transition-colors w-full justify-center">
      <Smartphone className="h-4 w-4" />
      Microsoft Store
    </Button>
  </a>
          </div>

        </div>

       {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-sm font-bold text-white">
            © {new Date().getFullYear()} SecurityX (formerly CyberScan AI). All rights reserved.
          </p>
          
          {/* ⚡ Using ml-auto with a negative margin or spacing offset to shift left */}
          <div className="flex gap-6 mr-12 sm:mr-20">
            <Link href="/legal" className="text-sm font-bold text-white hover:text-lime-400 transition-colors">
              Privacy Policy&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Link>
            <Link href="/legal" className="text-sm font-bold text-white hover:text-lime-400 transition-colors">
              Terms of Service&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}