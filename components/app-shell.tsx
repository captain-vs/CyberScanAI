"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Footer from "@/components/footer"

export default function AppShell() {
  const pathname = usePathname()

  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
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
    <div className="relative w-full">
      <Footer />
    </div>
  )
}