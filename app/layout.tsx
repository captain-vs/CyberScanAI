import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import AppShell from "@/components/app-shell"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { ChatBox } from "@/components/chat/chatbox"
import { SpeedInsights } from "@vercel/speed-insights/next"
// 1. Configure Fonts
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// 2. 📱 VIEWPORT (Optimizes mobile browser tab colors)
export const viewport: Viewport = {
  themeColor: "#000000",
}

// 3.SEO METADATA (The "Identity Card" for Google)
export const metadata: Metadata = {
  //  NEW: Base URL so Next.js can resolve your images properly
  metadataBase: new URL("https://securityx.in"),
  manifest: "/manifest.json",
 title: {
  default: "SecurityX | Learn Cybersecurity Through Practice",
  template: "%s | SecurityX",
},
description:
  "SecurityX is a beginner-friendly cybersecurity learning platform with lessons, quizzes, interactive challenges, progress tracking, and safe OSINT learning simulations.",
keywords: [
  "cybersecurity learning",
  "cybersecurity for beginners",
  "CTF practice",
  "security quizzes",
  "cybersecurity lessons",
  "ethical hacking education",
],
 authors: [{ name: "Vishnu Suthar" }],
  creator: "SecurityX",



  
  //4: Tells Google this is the primary version of your site
  alternates: {
    canonical: "/",
  },
  
  // 5. Smart Icons
icons: {
    icon: "/favicon.png", // Ensure favicon.png is in your /public folder
    apple: "/apple-icon.png",
  },

  // 6. Social Media Cards (Open Graph)
  openGraph: {
    title: "SecurityX",
    description: "SecurityX is a beginner-friendly cybersecurity learning platform with lessons, quizzes, interactive challenges, progress tracking, and safe OSINT learning simulations.",
    url: "https://securityx.in",
    siteName: "SecurityX",
    images: [
      {
        url: "/og-image.png", // Must be in your /public folder!
        width: 1200,
        height: 630,
        alt: "SecurityX Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 7. Twitter-Specific Cards
  twitter: {
    card: "summary_large_image",
    title: "SecurityX | Learn Cybersecurity Through Practice",
    description: "Learn cybersecurity through lessons, quizzes, interactive challenges, and safe educational simulations.",
    images: ["/og-image.png"], // Uses the same image from your /public folder
  },

  // 8. Search Engine Verification
  verification: {
    google: "ob1uQivcBWJLBn8m46x3zjZfUnPdZFCqwOoV0lC1vsU", 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
    <head>
      <meta name="google-adsense-account" content="ca-pub-6753717364472113"></meta>
    </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-black text-white`}>
        
        {/* Top Navigation Bar */}
        <Navigation />
        
        <ServiceWorkerRegistration />
        {/* Main Content */}
        {children}
        
        <ChatBox />
        {/* App Shell (Chat, Footer, etc.) */}
        <AppShell />
        
        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
        
      </body>
    </html>
  )
}