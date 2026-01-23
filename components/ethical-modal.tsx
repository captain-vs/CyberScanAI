"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, ShieldCheck, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function EthicalModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has already agreed
    const hasAgreed = localStorage.getItem("cyber-ethics-agreed")
    if (!hasAgreed) {
      setIsOpen(true)
    }
  }, [])

  const handleAgree = () => {
    localStorage.setItem("cyber-ethics-agreed", "true")
    setIsOpen(false)
  }

  const handleDecline = () => {
    window.location.href = "https://google.com" // Or redirect to a safe page
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* 1. BACKDROP BLUR */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* 2. THE WARNING CARD */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-red-500/30 bg-[#0f141f] shadow-[0_0_50px_rgba(239,68,68,0.2)]"
          >
            {/* Red Warning Stripe */}
            <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-wide uppercase">
                Restricted Access: Authorization Required
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                  <strong className="text-white">Attention Operative:</strong> You are accessing powerful cybersecurity tools capable of gathering sensitive intelligence and scanning protected infrastructure.
                </p>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-400" />
                    Protocol Compliance
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li>I will NOT scan targets without explicit permission.</li>
                    <li>I understand that unauthorized scanning is a criminal offense.</li>
                    <li>I will use this platform solely for educational & defensive purposes.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 hover:bg-slate-800 hover:text-white"
                  onClick={handleDecline}
                >
                  Exit Platform
                </Button>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  onClick={handleAgree}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  I AGREE & ENTER
                </Button>
              </div>
            </div>

            {/* Decorative bottom line */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}