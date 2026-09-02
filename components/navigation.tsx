"use client"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import {
  Shield,
  Scan,
  BookOpen,
  Gamepad2,
  UserIcon,
  Menu,
  LogOut,
  LayoutDashboard,
  Globe, 
  Bell,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, query, where, onSnapshot, doc, getDocs, writeBatch } from "firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scanning Hub", icon: Scan },
  { href: "/learn", label: "Education Hub", icon: BookOpen },
  { href: "/gamezone", label: "GameZone", icon: Gamepad2 },
  { href: "/osint", label: "OSINT Hub", icon: Globe },
]

type NavUser = {
  uid: string
  name: string
  email: string
  avatarUrl?: string
}

function getTwoLetterInitials(name: string) {
  if (!name) return "SX"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<NavUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  /* 🔔 ALERT NOTIFICATION STATES */
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingReqCount, setPendingReqCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          avatarUrl: ""
        })

        const userDocRef = doc(db, "users", firebaseUser.uid)
        const unsubDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            setUser({
              uid: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              avatarUrl: data.avatarUrl || ""
            })
          }
        }, (err) => console.warn("Nav profile listener note:", err))

        setLoading(false)
        return () => unsubDoc()
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (!user) return

    const msgQuery = query(collection(db, "messages"), where("receiverUid", "==", user.uid), where("read", "==", false))
    const unsubMsgs = onSnapshot(msgQuery, (snap) => {
      setUnreadCount(snap.size)
    }, (err) => console.warn("Header msg alert note:", err))

    const reqQuery = query(collection(db, "connectionRequests"), where("receiverUid", "==", user.uid), where("status", "==", "pending"))
    const unsubReqs = onSnapshot(reqQuery, (snap) => {
      setPendingReqCount(snap.size)
    }, (err) => console.warn("Header req alert note:", err))

    return () => {
      unsubMsgs()
      unsubReqs()
    }
  }, [user?.uid])

  const handleToggleNotifications = async () => {
    const nextState = !showNotifications
    setShowNotifications(nextState)

    // When opening notifications, clear unread messages badge instantly
    if (nextState && user && unreadCount > 0) {
      setUnreadCount(0)
      try {
        const q = query(
          collection(db, "messages"),
          where("receiverUid", "==", user.uid),
          where("read", "==", false)
        )
        const snap = await getDocs(q)
        if (!snap.empty) {
          const batch = writeBatch(db)
          snap.forEach(d => {
            batch.update(doc(db, "messages", d.id), { read: true })
          })
          await batch.commit()
        }
      } catch (err) {
        console.warn("Failed to mark notifications read:", err)
      }
    }
  }

  const handleLogout = async () => {
    setIsOpen(false)
    router.push("/")
    setTimeout(async () => {
      await signOut(auth)
    }, 50)
  }

  if (pathname.startsWith("/auth")) return null
  if (loading) return null

  const totalAlerts = unreadCount + pendingReqCount

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold"
        >
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Security<span className="text-primary">X</span></span>
        </Link>

        {user ? (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side controls: Notification bell is now visible on both mobile and desktop */}
            <div className="flex items-center gap-2 md:gap-3">
              
              <div className="relative" ref={notifRef}>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleToggleNotifications}
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white relative h-9 w-9 md:h-10 md:w-10 rounded-xl"
                >
                  <Bell className="h-4 w-4 text-cyan-400" />
                  {totalAlerts > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold border-2 border-slate-950 shadow-lg">
                      {totalAlerts}
                    </span>
                  )}
                </Button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 md:w-[380px] bg-[#1a2234] border border-[#2a374c] rounded-lg shadow-2xl z-50 overflow-hidden font-sans text-slate-200"
                    >
                      <div className="bg-[#151c2a] px-4 py-3 border-b border-[#2a374c] flex items-center justify-between">
                        <span className="text-white text-xs font-semibold tracking-wide uppercase flex items-center gap-2">
                          <Bell className="h-3.5 w-3.5 text-cyan-400" /> Notifications & Updates
                        </span>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#2a374c]">
                        
                        <div 
                          onClick={() => {
                            setShowNotifications(false)
                            if ((window as any).__openGlobalChat) {
                              (window as any).__openGlobalChat();
                            }
                          }}
                          className="block p-4 hover:bg-[#202b3f] transition group cursor-pointer"
                        >
                          <div className="text-[15px] font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                            Secure Operator Communications & Messaging Hub
                          </div>
                          <p className="text-[13px] text-slate-300 mt-1.5 leading-relaxed">
                            Click here to open your floating chat widget and talk to connected operators.
                          </p>
                          <div className="text-[11px] text-slate-400 mt-2 font-mono">
                            Active stream
                          </div>
                        </div>
                        
                        <Link 
                          href="/learn" 
                          onClick={() => setShowNotifications(false)}
                          className="block p-4 hover:bg-[#202b3f] transition group"
                        >
                          <div className="text-[15px] font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                            [New] OSI & TCP/IP Model Labs on Education Hub
                          </div>
                          <p className="text-[13px] text-slate-300 mt-1.5 leading-relaxed">
                            Explore new interactive CTF modules added to the Education Hub.
                          </p>
                          <div className="text-[11px] text-slate-400 mt-2 font-mono">
                            Just now
                          </div>
                        </Link>

                        {pendingReqCount > 0 && (
                          <Link 
                            href="/profile" 
                            onClick={() => setShowNotifications(false)}
                            className="block p-4 hover:bg-[#202b3f] transition group"
                          >
                            <div className="text-[15px] font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                              Pending Operator Connection Requests
                            </div>
                            <p className="text-[13px] text-slate-300 mt-1.5 leading-relaxed">
                              You have <span className="text-purple-400 font-semibold">{pendingReqCount} pending request(s)</span> waiting in your profile.
                            </p>
                            <div className="text-[11px] text-slate-400 mt-2 font-mono">
                              Pending action
                            </div>
                          </Link>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop User Avatar Dropdown */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-slate-700 hover:border-lime-400 transition-all">
                      <Avatar className="h-full w-full rounded-full bg-slate-900">
                        {user.avatarUrl && user.avatarUrl.trim() !== "" ? (
                          <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover h-full w-full" />
                        ) : null}
                        <AvatarFallback className="bg-slate-900 text-lime-400 font-mono text-xs font-bold rounded-full flex items-center justify-center w-full h-full">
                          {getTwoLetterInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 font-mono">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-bold text-white truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile & Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-500 focus:text-red-500"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Hamburger Sheet Trigger */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>

                <SheetContent>
                  <SheetTitle className="hidden">Navigation Menu</SheetTitle>
                  <VisuallyHidden>
                    <h2>Mobile Navigation</h2>
                  </VisuallyHidden>

                  <div className="mb-6 flex items-center gap-2 font-bold">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold text-blue-400">
                      Security<span className="text-lime-400">X</span>
                    </span>
                  </div>

                  <Link 
                    href="/profile" 
                    onClick={() => setIsOpen(false)}
                    className="mb-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 transition-all active:scale-95 active:bg-slate-900 hover:border-cyan-500/50"
                  >
                    <Avatar className="h-10 w-10 rounded-full border border-slate-700 shrink-0 bg-slate-900">
                      {user.avatarUrl && user.avatarUrl.trim() !== "" ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover h-full w-full" />
                      ) : null}
                      <AvatarFallback className="bg-slate-900 text-lime-400 font-mono text-xs font-bold rounded-full flex items-center justify-center w-full h-full">
                        {getTwoLetterInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden text-left font-mono">
                      <span className="truncate text-sm font-semibold text-slate-200">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-slate-500">
                        Profile & Settings
                      </span>
                    </div>
                  </Link>

                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname.startsWith(item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                            isActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:bg-accent",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )
                    })}

                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="justify-start mt-4 font-mono text-xs"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>

            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth?mode=login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth?mode=register">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}