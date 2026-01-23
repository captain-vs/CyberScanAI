"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { MessageSquare, X, Send, Bot, User, Minimize2 } from "lucide-react"
import { predefinedQA } from "./predefined-qa"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

export function ChatBox() {
  const pathname = usePathname()

  if (pathname.startsWith("/auth")) {
    return null
  }

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "System Online. I am the Cyber Assistant. How can I assist with your mission?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim()
    if (!question) return

    setMessages((prev) => [...prev, { role: "user", text: question }])
    setInput("")
    setIsTyping(true)

    const predefined = predefinedQA.find((qa) =>
      qa.keywords.some((k) => question.toLowerCase().includes(k))
    )

    if (predefined) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "bot", text: predefined.answer }])
        setIsTyping(false)
      }, 600)
      return
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error("AI failed")

      setMessages((prev) => [...prev, { role: "bot", text: data.answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Connection severed. AI mainframe unavailable." },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {/* CLOSED STATE: FLOATING BUTTON (Simple Fade) */}
        {!open && (
          <motion.button
            key="chat-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }} // Fast and clean
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.5)] border border-lime-400 text-black hover:bg-lime-400 transition-colors"
          >
            <MessageSquare className="h-7 w-7" />
          </motion.button>
        )}

        {/* OPEN STATE: CHAT WINDOW (Clean Slide Up) */}
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }} // Start slightly lower and smaller
            animate={{ opacity: 1, y: 0, scale: 1 }}     // Snap to full size
            exit={{ opacity: 0, y: 20, scale: 0.95 }}    // Fade out downwards
            transition={{ duration: 0.2, ease: "easeInOut" }} // No bounce, just smooth
            className="fixed bottom-6 right-6 z-50 w-[350px] md:w-[400px]"
          >
            <Card className="flex flex-col h-[550px] overflow-hidden border-lime-500/30 bg-[#0a0f18]/95 backdrop-blur-xl shadow-2xl rounded-2xl">
              
              {/* HEADER */}
              <div className="flex items-center justify-between p-4 border-b border-lime-500/20 bg-lime-500/5">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                  <div>
                    <p className="font-bold text-white text-sm">Cyber Assistant</p>
                    <p className="text-[10px] text-lime-400 uppercase tracking-wider font-mono">v2.0 Online</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
              </div>

              {/* MESSAGES AREA */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }} // Simple slide up for messages
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      m.role === "user" ? "bg-purple-500/20 text-purple-400" : "bg-lime-500/20 text-lime-400"
                    }`}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div className={`p-3 rounded-xl max-w-[80%] text-sm leading-relaxed ${
                      m.role === "user" 
                        ? "bg-purple-500/10 border border-purple-500/20 text-purple-100 rounded-tr-none" 
                        : "bg-lime-500/10 border border-lime-500/20 text-lime-100 rounded-tl-none"
                    }`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center">
                       <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-lime-500/10 border border-lime-500/20 p-3 rounded-xl rounded-tl-none flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* INPUT AREA */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask command..."
                    className="bg-slate-950 border-slate-800 focus:border-lime-500/50 text-white placeholder:text-slate-600"
                  />
                  <Button type="submit" size="icon" className="bg-lime-500 hover:bg-lime-400 text-black">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}