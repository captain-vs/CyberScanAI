"use client"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Shield,
  Scan,
  BookOpen,
  Gamepad2,
  UserIcon,
  Menu,
  LogOut,
  LayoutDashboard,
  Globe, // Changed icon for OSINT
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger,SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"

/* ✅ CENTRAL NAV CONFIG WITH OSINT */
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scanning Hub", icon: Scan },
  { href: "/learn", label: "Education Hub", icon: BookOpen },
  { href: "/gamezone", label: "GameZone", icon: Gamepad2 },
  { href: "/osint", label: "OSINT Hub", icon: Globe },
]

type NavUser = {
  name: string
  email: string
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<NavUser | null>(null)
  const [loading, setLoading] = useState(true)

  /* 🔥 FIREBASE AUTH LISTENER */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const handleLogout = async () => {
    router.push("/")
  
  // 2. Wait a tiny bit (50ms) for the page to unmount
  setTimeout(async () => {
    await signOut(auth)
  }, 50)
  }

  /* ❌ Hide nav on auth pages */
  if (pathname.startsWith("/auth")) return null
  if (loading) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LOGO */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold"
        >
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl">CyberScan AI</span>
        </Link>

        {user ? (
          <>
            {/* ===== DESKTOP NAV ===== */}
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

            {/* ===== USER MENU ===== */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ===== MOBILE NAV ===== */}
            <Sheet>
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
                  CyberScan AI
                </div>

                <div className="mb-6 rounded-lg bg-muted p-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname.startsWith(item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
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
                    className="justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}