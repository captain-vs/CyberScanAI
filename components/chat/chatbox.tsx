"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { MessageSquare, Bot, User, Minimize2, Send, ArrowLeft, UserPlus, ShieldCheck } from "lucide-react"
import { predefinedQA } from "./predefined-qa"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { auth, db } from "@/lib/firebase"
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDocs, 
  where, 
  writeBatch, 
  addDoc, 
  serverTimestamp, 
  updateDoc 
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

type OperatorUser = {
  uid: string
  name: string
  level: number
  avatarUrl?: string
  profileVisibility?: "public" | "private"
}

type Message = {
  id: string
  senderUid: string
  receiverUid: string
  text: string
  timestamp: any
  read?: boolean
}

export function ChatBox() {
  const pathname = usePathname()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [open, setOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeChatTarget, setActiveChatTarget] = useState<"ai" | OperatorUser>("ai")
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar")
  
  // AI Chat States
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "System Online. I am the Cyber Assistant. How can I assist with your mission?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Peer-to-Peer Operator Chat States
  const [myConnections, setMyConnections] = useState<string[]>([])
  const [allOperatorsMap, setAllOperatorsMap] = useState<Record<string, OperatorUser>>({})
  const [allMessagesMap, setAllMessagesMap] = useState<Record<string, Message[]>>({})
  const [peerMessages, setPeerMessages] = useState<Message[]>([])

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      setAuthChecking(false)
    })
    return () => unsub()
  }, [])

  // Global window helpers
  useEffect(() => {
    (window as any).__openGlobalChat = () => {
      setOpen(true)
    }

    (window as any).__openChatWithUser = async (targetUid: string) => {
      setOpen(true)
      const op = allOperatorsMap[targetUid]
      if (op) {
        setActiveChatTarget(op)
        setMobileView("chat")
        markMessagesAsRead(targetUid)
      } else {
        try {
          const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", targetUid)))
          if (!userDoc.empty) {
            const dData = userDoc.docs[0].data()
            const targetOp: OperatorUser = {
              uid: targetUid,
              name: dData.name || "Operator",
              level: dData.stats?.level || 1,
              avatarUrl: dData.avatarUrl || "",
              profileVisibility: dData.profileVisibility || "public"
            }
            setActiveChatTarget(targetOp)
            setMobileView("chat")
            markMessagesAsRead(targetUid)
          }
        } catch (err) {
          console.warn("Could not fetch target user profile:", err)
        }
      }
    }
  }, [allOperatorsMap])

  // Auth & Firestore real-time sync
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return
      setCurrentUser(user)

      const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const opsMap: Record<string, OperatorUser> = {}
        let connectionsList: string[] = []

        snap.forEach(d => {
          const dData = d.data()
          if (d.id === user.uid) {
            connectionsList = dData.connections || []
          } else {
            opsMap[d.id] = {
              uid: d.id,
              name: dData.name || "Operator",
              level: dData.stats?.level || 1,
              avatarUrl: dData.avatarUrl || "",
              profileVisibility: dData.profileVisibility || "public"
            }
          }
        })

        setMyConnections(connectionsList)
        setAllOperatorsMap(opsMap)
      }, (err) => {
        if (auth.currentUser) console.warn("Users listener note:", err)
      })

      const unsubMsgs = onSnapshot(collection(db, "messages"), (snap) => {
        const map: Record<string, Message[]> = {}
        snap.forEach(d => {
          const m = { id: d.id, ...d.data() } as Message
          if (m.senderUid === user.uid || m.receiverUid === user.uid) {
            const partnerUid = m.senderUid === user.uid ? m.receiverUid : m.senderUid
            if (!map[partnerUid]) map[partnerUid] = []
            map[partnerUid].push(m)
          }
        })
        Object.keys(map).forEach(partner => {
          map[partner].sort((a, b) => {
            const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0
            const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0
            return timeA - timeB
          })
        })
        setAllMessagesMap(map)
      }, (err) => {
        if (auth.currentUser) console.warn("Messages listener note:", err)
      })

      return () => {
        unsubUsers()
        unsubMsgs()
      }
    })

    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (activeChatTarget === "ai" || !currentUser) return
    const otherUid = activeChatTarget.uid
    setPeerMessages(allMessagesMap[otherUid] || [])
    markMessagesAsRead(otherUid)
  }, [activeChatTarget, allMessagesMap, currentUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [aiMessages, peerMessages, isTyping])

  const markMessagesAsRead = async (partnerUid: string) => {
    if (!currentUser) return
    try {
      const q = query(
        collection(db, "messages"),
        where("senderUid", "==", partnerUid),
        where("receiverUid", "==", currentUser.uid),
        where("read", "==", false)
      )
      const snap = await getDocs(q)
      if (snap.empty) return

      const batch = writeBatch(db)
      snap.forEach(d => {
        batch.update(doc(db, "messages", d.id), { read: true })
      })
      await batch.commit()
    } catch (err) {
      console.warn("Mark read error:", err)
    }
  }

  const handleConnectBack = async (targetOp: OperatorUser) => {
    if (!currentUser) return
    const myUid = currentUser.uid

    const updatedMyConnections = [...myConnections, targetOp.uid]
    await updateDoc(doc(db, "users", myUid), { connections: updatedMyConnections })
    setMyConnections(updatedMyConnections)

    try {
      const targetRef = doc(db, "users", targetOp.uid)
      const targetSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", targetOp.uid)))
      if (!targetSnap.empty) {
        const targetData = targetSnap.docs[0].data()
        const targetConns = targetData.connections || []
        if (!targetConns.includes(myUid)) {
          await updateDoc(targetRef, { connections: [...targetConns, myUid] })
        }
      }
    } catch (err) {
      console.warn("Mutual connect back error:", err)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    if (activeChatTarget === "ai") {
      setAiMessages((prev) => [...prev, { role: "user", text }])
      setInput("")
      setIsTyping(true)

      const predefined = predefinedQA.find((qa) =>
        qa.keywords.some((k) => text.toLowerCase().includes(k))
      )

      if (predefined) {
        setTimeout(() => {
          setAiMessages((prev) => [...prev, { role: "bot", text: predefined.answer }])
          setIsTyping(false)
        }, 600)
        return
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error("AI failed")
        setAiMessages((prev) => [...prev, { role: "bot", text: data.answer }])
      } catch {
        setAiMessages((prev) => [
          ...prev,
          { role: "bot", text: "Connection severed. AI mainframe unavailable." },
        ])
      } finally {
        setIsTyping(false)
      }
    } else {
      if (!currentUser) return
      const textToSend = text
      setInput("")

      try {
        await addDoc(collection(db, "messages"), {
          senderUid: currentUser.uid,
          receiverUid: activeChatTarget.uid,
          text: textToSend,
          timestamp: serverTimestamp(),
          read: false
        })
      } catch (err) {
        console.error("Message send error:", err)
      }
    }
  }

  const totalUnread = Object.keys(allMessagesMap).reduce((acc, partnerUid) => {
    const list = allMessagesMap[partnerUid] || []
    return acc + list.filter(m => m.senderUid === partnerUid && !m.read).length
  }, 0)

  // Sidebar list: Include connected operators AND any operator who has an active message history with us
  const sidebarOperatorUids = Array.from(new Set([
    ...myConnections,
    ...Object.keys(allMessagesMap)
  ]))

  const sidebarOperators = sidebarOperatorUids
    .map(uid => allOperatorsMap[uid])
    .filter(Boolean) as OperatorUser[]

  if (pathname.startsWith("/auth") || authChecking || !isLoggedIn) {
    return null
  }

  const isConnectedToActiveTarget = activeChatTarget === "ai" || myConnections.includes(activeChatTarget.uid)

  return (
    <>
      <AnimatePresence mode="wait">
        {!open && (
          <motion.button
            key="chat-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-lime-500 shadow-[0_0_25px_rgba(132,204,22,0.6)] border border-lime-400 text-black hover:bg-lime-400 transition-colors"
          >
            <MessageSquare className="h-6 w-6 md:h-7 md:w-7" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold border-2 border-slate-950 animate-pulse">
                {totalUnread}
              </span>
            )}
          </motion.button>
        )}

        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-x-2 bottom-2 md:inset-x-auto md:bottom-6 md:right-6 z-[9999] md:w-[680px]"
          >
            <Card className="flex h-[82vh] md:h-[550px] overflow-hidden border-lime-500/30 bg-[#0a0f18]/95 backdrop-blur-xl shadow-2xl rounded-2xl">
              
              {/* LEFT SIDEBAR */}
              <div className={`w-full md:w-1/3 bg-slate-900/90 border-r border-slate-800 flex flex-col font-mono ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
                <div className="p-3.5 border-b border-slate-800 text-xs text-white font-bold flex items-center justify-between">
                  <span>Communications Hub</span>
                  <button 
                    onClick={() => setOpen(false)}
                    className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  <button
                    onClick={() => {
                      setActiveChatTarget("ai")
                      setMobileView("chat")
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition ${
                      activeChatTarget === "ai" ? 'bg-lime-500/10 border border-lime-500/30 text-lime-400' : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="h-9 w-9 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0 border border-lime-500/30">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">Cyber Assistant</div>
                      <div className="text-[10px] text-lime-400/80">AI Mainframe</div>
                    </div>
                  </button>

                  <div className="pt-2 pb-1 px-2 text-[10px] uppercase tracking-wider text-slate-500">Operator Inbox</div>

                  {sidebarOperators.length === 0 ? (
                    <div className="text-center p-3 text-slate-500 text-[11px]">No active conversations.</div>
                  ) : (
                    sidebarOperators.map(op => {
                      const isSelected = activeChatTarget !== "ai" && activeChatTarget.uid === op.uid
                      const chatList = allMessagesMap[op.uid] || []
                      const lastMsg = chatList[chatList.length - 1]
                      const hasUnread = chatList.some(m => m.senderUid === op.uid && !m.read)

                      return (
                        <button
                          key={op.uid}
                          onClick={() => {
                            setActiveChatTarget(op)
                            setMobileView("chat")
                            markMessagesAsRead(op.uid)
                          }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition ${
                            isSelected ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'hover:bg-slate-800/50 text-slate-300'
                          }`}
                        >
                          <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                            {op.avatarUrl ? <AvatarImage src={op.avatarUrl} className="object-cover" /> : null}
                            <AvatarFallback className="bg-slate-800 text-lime-400 text-xs">{op.name.slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold truncate">{op.name}</span>
                              {hasUnread && <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse shrink-0" />}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {lastMsg ? lastMsg.text : `Level ${op.level} Operator`}
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* RIGHT SIDE: ACTIVE CHAT PANE */}
              <div className={`w-full md:w-2/3 flex flex-col bg-[#0a0f18]/95 ${mobileView === "sidebar" ? "hidden md:flex" : "flex"}`}>
                
                <div className="flex items-center justify-between p-3.5 border-b border-lime-500/20 bg-lime-500/5">
                  <div className="flex items-center gap-3 font-mono">
                    <button 
                      onClick={() => setMobileView("sidebar")}
                      className="md:hidden text-slate-400 hover:text-white transition-colors p-1 mr-1"
                      aria-label="Back to contacts list"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    {activeChatTarget === "ai" ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                        <div>
                          <p className="font-bold text-white text-xs">Cyber Assistant</p>
                          <p className="text-[9px] text-lime-400 uppercase tracking-wider">v2.0 Online</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Avatar className="h-8 w-8 border border-slate-700">
                          {activeChatTarget.avatarUrl ? <AvatarImage src={activeChatTarget.avatarUrl} className="object-cover" /> : null}
                          <AvatarFallback className="bg-slate-800 text-lime-400 text-xs">{activeChatTarget.name.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-white text-xs">{activeChatTarget.name}</p>
                          <p className="text-[9px] text-cyan-400">Level {activeChatTarget.level} Operator • Secure Channel</p>
                        </div>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={() => setOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                </div>

                {/* MESSAGES VIEW (Visible to read regardless of connection state) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar font-mono text-xs">
                  {activeChatTarget === "ai" ? (
                    aiMessages.map((m, i) => (
                      <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          m.role === "user" ? "bg-purple-500/20 text-purple-400" : "bg-lime-500/20 text-lime-400"
                        }`}>
                          {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        </div>
                        <div className={`p-2.5 rounded-xl max-w-[80%] text-xs leading-relaxed ${
                          m.role === "user" 
                            ? "bg-purple-500/10 border border-purple-500/20 text-purple-100 rounded-tr-none font-sans" 
                            : "bg-lime-500/10 border border-lime-500/20 text-lime-100 rounded-tl-none font-sans"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))
                  ) : (
                    peerMessages.length === 0 ? (
                      <div className="text-center text-slate-500 py-24 font-mono">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20 text-cyan-400" />
                        <p className="text-xs">Secure channel initialized with {activeChatTarget.name}.</p>
                        <p className="text-[10px] text-slate-600 mt-1">Send a message below.</p>
                      </div>
                    ) : (
                      peerMessages.map((msg) => {
                        const isMe = msg.senderUid === currentUser?.uid
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${
                              isMe ? 'bg-lime-500 text-black font-semibold rounded-br-none' : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        )
                      })
                    )
                  )}

                  {isTyping && activeChatTarget === "ai" && (
                    <div className="flex gap-3">
                      <div className="h-7 w-7 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center">
                         <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="bg-lime-500/10 border border-lime-500/20 p-2.5 rounded-xl rounded-tl-none flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* INPUT BAR OR CONNECT-BACK BAR */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/50">
                  {isConnectedToActiveTarget ? (
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                      className="flex gap-2"
                    >
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={activeChatTarget === "ai" ? "Ask AI command..." : "Type secure message..."}
                        className="bg-slate-950 border-slate-800 focus:border-lime-500/50 text-white placeholder:text-slate-600 font-mono text-xs"
                      />
                      <Button type="submit" size="icon" className="bg-lime-500 hover:bg-lime-400 text-black h-9 w-9 shrink-0">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-cyan-500/30 font-mono text-xs">
                      <span className="text-slate-400 text-[11px]">Connect back to reply</span>
                      <Button
                        size="sm"
                        onClick={() => handleConnectBack(activeChatTarget as OperatorUser)}
                        className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold h-7 text-xs"
                      >
                        <UserPlus className="h-3 w-3 mr-1" /> Connect Back
                      </Button>
                    </div>
                  )}
                </div>

              </div>

            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}