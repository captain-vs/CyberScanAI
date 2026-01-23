"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"
import { ChatBox } from "@/components/chat/chatbox"
export default function AppShell() {
  const pathname = usePathname()
  
  // Check for Auth pages OR the Landing page ("/")
  const isHiddenPage = pathname.startsWith("/auth") || pathname === "/"

  if (isHiddenPage) return null

  return (
    <>
      
      <Footer />
      <ChatBox />
    </>
  )
}