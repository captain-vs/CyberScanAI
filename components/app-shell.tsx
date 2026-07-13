"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"
import { ChatBox } from "@/components/chat/chatbox"

export default function AppShell() {
  const pathname = usePathname()

  useEffect(() => {
    // Prevent immediate exit on mobile back button
    const handleBackButton = (event: PopStateEvent) => {
      // If we are at the root, push state again to stay in app
      if (window.location.pathname === "/") {
        window.history.pushState(null, "", window.location.href)
        alert("Press back again to exit, or stay here to continue learning!")
      }
    }

    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handleBackButton)

    return () => window.removeEventListener("popstate", handleBackButton)
  }, [])

  const isHiddenPage = pathname.startsWith("/auth") || pathname === "/"

  if (isHiddenPage) return null

  return (
    <>
      <Footer />
      <ChatBox />
    </>
  )
}