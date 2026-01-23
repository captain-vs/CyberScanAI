"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Github, Twitter, Linkedin, Heart } from "lucide-react"

export function Footer() {
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
              <span className="text-xl tracking-tight">CyberScan AI</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Advanced threat detection and cybersecurity education platform. 
              Secure your digital footprint with next-gen scanning tools.
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
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/learn" className="transition-colors hover:text-lime-400">Documentation</Link>
              </li>
              <li>
                <Link href="/roadmap" className="transition-colors hover:text-lime-400">Cyber Roadmap</Link>
              </li>
              <li>
                <Link href="/gamezone/leaderboard" className="transition-colors hover:text-lime-400">Leaderboard</Link>
              </li>
              <li>
                <Link href="/profile" className="transition-colors hover:text-lime-400">User Profile</Link>
              </li>
            </ul>
          </div>

          {/* Social / Connect */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Connect</h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="rounded-lg bg-slate-900 p-2 text-slate-400 transition-all hover:bg-lime-500 hover:text-black"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="rounded-lg bg-slate-900 p-2 text-slate-400 transition-all hover:bg-lime-500 hover:text-black"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="rounded-lg bg-slate-900 p-2 text-slate-400 transition-all hover:bg-lime-500 hover:text-black"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            
            <p className="mt-6 text-xs text-slate-500">
              System Status: <span className="text-lime-500 font-medium">● Operational</span>
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          {/* ⚡ UPDATED: 'text-white' and 'font-bold' */}
          <p className="text-sm font-bold text-white">
            © {new Date().getFullYear()} CyberScan AI. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            {/* ⚡ UPDATED: Links are now Pure White & Bold */}
            <Link href="#" className="text-sm font-bold text-white hover:text-lime-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-bold text-white hover:text-lime-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}