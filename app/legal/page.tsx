"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, Shield, FileText } from "lucide-react"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-black text-slate-300 py-12 md:py-20 relative font-sans">
      
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-400 hover:text-white font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-12 border-b border-slate-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Legal & Policies
          </h1>
          <p className="text-slate-400 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-12">
          
          {/* CRITICAL: EDUCATIONAL DISCLAIMER */}
          <section className="bg-red-500/10 border border-red-500/30 p-6 md:p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" /> STRICT EDUCATIONAL DISCLAIMER
            </h2>
            <div className="space-y-4 text-red-200/80 leading-relaxed">
              <p>
                <strong>CyberScan AI is strictly an educational platform.</strong> The tools, simulators, and information provided on this website (including but not limited to OSINT trackers, URL scanners, and GameZone challenges) are designed exclusively for learning cybersecurity concepts, ethical hacking training, and academic research.
              </p>
              <p>
                Any actions and/or activities related to the material contained within this website are solely your responsibility. <strong>The creator(s) and administrators of CyberScan AI will not be held responsible</strong> for any criminal charges, damages, or illegal actions brought against any individuals resulting from the misuse of the tools or information provided on this platform.
              </p>
              <p>
                By using this site, you explicitly agree not to use these tools to target, scan, or attack any system, network, or individual without explicit, documented permission.
              </p>
            </div>
          </section>

          {/* Terms of Service */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-500" /> Terms of Service
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <h3 className="text-xl font-semibold text-slate-200 mt-6">1. Acceptance of Terms</h3>
              <p>By accessing and using CyberScan AI, you accept and agree to be bound by the terms and provisions of this agreement.</p>
              
              <h3 className="text-xl font-semibold text-slate-200 mt-6">2. Acceptable Use</h3>
              <p>You agree to use the platform only for lawful, educational purposes. You shall not use the OSINT tools to harass, stalk, or dox any individual. You shall not use the URL/File scanning tools to reverse-engineer or distribute malware.</p>

              <h3 className="text-xl font-semibold text-slate-200 mt-6">3. Account Termination</h3>
              <p>We reserve the right to terminate or suspend your account and block access to the platform immediately, without prior notice or liability, if you breach these Terms of Service or violate the Educational Disclaimer.</p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-500" /> Privacy Policy
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <h3 className="text-xl font-semibold text-slate-200 mt-6">1. Data Collection</h3>
              <p>When you register for CyberScan AI, we collect basic authentication information (such as your email address and display name) required to maintain your GameZone progress and scan history. This authentication is securely handled by Google Firebase.</p>

              <h3 className="text-xl font-semibold text-slate-200 mt-6">2. Tool Usage & Scanning Data</h3>
              <p>URLs, files, and IPs submitted to our scanning engine may be analyzed by our backend AI systems. Do not submit highly sensitive, confidential, or personally identifiable information into the public scanners.</p>

              <h3 className="text-xl font-semibold text-slate-200 mt-6">3. Data Sharing</h3>
              <p>We do not sell, trade, or rent your personal identification information to others. Your data is used exclusively to operate, maintain, and improve the CyberScan AI platform.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}