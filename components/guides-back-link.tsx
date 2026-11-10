"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/lib/firebase"

export function GuidesBackLink() {
  const [destination, setDestination] = useState({
    href: "/",
    label: "Back to Home",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setDestination({
          href: "/dashboard",
          label: "Back to Dashboard",
        })
      } else {
        setDestination({
          href: "/",
          label: "Back to Home",
        })
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <Link
      href={destination.href}
      className="mb-8 inline-flex items-center rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2 font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {destination.label}
    </Link>
  )
}