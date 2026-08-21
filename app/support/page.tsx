"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HelpCircle, Mail, MessageSquare, Send, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "What is SecurityX, and what tools does it offer?",
    a: "SecurityX is an all-in-one cybersecurity platform featuring an AI-powered Scanning Hub for URLs/files, an Advanced OSINT Suite for intelligence gathering, an Education Hub with structured labs, and the GameZone."
  },
  {
    q: "How do I participate in the Cyber Dominion: Siege Arena?",
    a: "You can enter the Siege Arena directly from the Education Hub (Module 3) or via your main Dashboard card. It places you into a live 5-player multiplayer room where you can deploy payloads like SQLi, DDoS, and Phishing while protecting your hub."
  },
  {
    q: "How do XP points and Leveling work?",
    a: "You earn XP by running scans, completing quizzes, finishing CTF challenges, and winning matches in the Siege Arena. As your XP increases, your account level rises automatically, tracking your growth from a novice to a pro operative."
  },
  {
    q: "Are the scanners and penetration testing tools safe to use?",
    a: "Yes! All scanning features and simulations are executed in secure, isolated sandbox environments or through safe heuristic analysis to ensure absolute safety for your system."
  },
  {
    q: "What happens if I lose my connection during a Siege match?",
    a: "Our server features a graceful disconnection engine. If your connection drops or you close your tab, your city turns into an 'Abandoned' state so remaining players aren't held up, though active match XP for that session will be forfeited."
  },
  {
    q: "How does the global leaderboard rank players?",
    a: "The global leaderboard ranks all active operatives by total accumulated XP. It displays the top 10 players globally and dynamically pins your own card if you fall below the top 10 for easy tracking."
  },
  {
    q: "How can I contact customer support directly?",
    a: "If you run into any technical issues or have inquiries, you can reach out directly to our official support team at customercare@securityx.in."
  }
]

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // ⚡ REPLACE THIS STRING WITH YOUR ACCESS KEY FROM WEB3FORMS
          access_key: "b5ca6937-4694-46a6-a05d-590589575ec7", 
          email: email,
          message: message,
          subject: "New Feedback Submission from SecurityX User",
        }),
      })

      const result = await response.json()
      if (result.success) {
        setSubmitted(true)
      } else {
        alert("Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-12">
        
        {/* Back Link */}
        <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white font-medium transition-colors bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-white tracking-tight">Help Center & <span className="text-blue-500">Support</span></h1>
          <p className="text-slate-400">Have questions about SecurityX, modules, or the Siege Arena? Explore our FAQs or drop us feedback below.</p>
        </div>

        {/* TOP SECTION: Send Feedback First, Then Direct Support Line */}
        <div className="grid gap-8 md:grid-cols-2 items-start">
          
          {/* Feedback Form Card */}
          <Card className="bg-[#0b0f17] border-slate-800 p-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-400" /> Send Feedback
            </h3>
            <p className="text-sm text-slate-400 mb-6">Help us improve SecurityX with your suggestions, bug reports, or feature requests.</p>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-white">We'll get back to you soon!</h4>
                <p className="text-xs text-slate-400">Thank you for helping shape SecurityX.</p>
                <Button onClick={() => { setSubmitted(false); setMessage(""); setEmail(""); }} variant="outline" size="sm" className="mt-4 border-slate-700 text-slate-300">
                  Send Another
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Your Email</label>
                  <Input 
                    type="email" 
                    required
                    placeholder="operative@securityx.in" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Your Feedback / Suggestion</label>
                  <Textarea 
                    required
                    rows={4}
                    placeholder="Tell us what features or changes you'd like to see..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-white resize-none"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 cursor-pointer">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} 
                  {loading ? "Sending..." : "Submit Feedback"}
                </Button>
              </form>
            )}
          </Card>

          {/* Direct Support Line Card */}
          <Card className="bg-[#0b0f17] border-slate-800 p-6 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Direct Support Line</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Prefer writing directly from your email client? Drop our customer care team a line anytime. We typically respond within 24 hours.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500 font-mono block mb-1">Official Support Email:</span>
              <a 
                href="mailto:customercare@securityx.in" 
                className="font-mono text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 text-sm"
              >
                customercare@securityx.in
              </a>
            </div>
          </Card>

        </div>

        {/* BOTTOM SECTION: Frequently Asked Questions */}
        <div className="space-y-6 pt-6 border-t border-slate-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-400" /> Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-[#0b0f17] border border-slate-800 rounded-xl px-4 overflow-hidden">
                <AccordionTrigger className="text-left text-white hover:text-blue-400 font-medium py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-400 pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </div>
  )
}