import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import AppShell from "@/components/app-shell"

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
  
  title: {
    default: "CyberScan AI - Best Cybersecurity Learning Platform for Beginners",
    template: "%s | CyberScan AI"
  },
  description: "Master cybersecurity with CyberScan AI. Analyze threats, complete interactive labs, and compete in our GameZone. The ultimate learning hub for beginners.",
  keywords: ["cybersecurity scanner", "phishing detector", "malware analysis", "osint tools", "CTF practice", "learn hacking", "url scanner"],
  authors: [{ name: "CyberScan Team" }],
  creator: "CyberScan AI",

  //4: Tells Google this is the primary version of your site
  alternates: {
    canonical: "/",
  },
  
  // 5. Smart Icons
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },

  // 6. Social Media Cards (Open Graph)
  openGraph: {
    title: "CyberScan AI",
    description: "Next-Gen AI Threat Detection. Scan URLs, Files, and IPs instantly.",
    url: "https://securityx.in",
    siteName: "CyberScan AI",
    images: [
      {
        url: "/og-image.png", // Must be in your /public folder!
        width: 1200,
        height: 630,
        alt: "CyberScan AI Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 7. Twitter-Specific Cards
  twitter: {
    card: "summary_large_image",
    title: "CyberScan AI - Best Cybersecurity Learning Platform",
    description: "Next-Gen AI Threat Detection. Scan URLs, Files, and IPs instantly.",
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
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-black text-white`}>
        
        {/* Top Navigation Bar */}
        <Navigation />
        
        {/* Main Content */}
        {children}
        
        {/* App Shell (Chat, Footer, etc.) */}
        <AppShell />
        
        {/* Vercel Analytics */}
        <Analytics />
        
      </body>
    </html>
  )
}