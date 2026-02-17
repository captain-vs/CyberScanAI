import type React from "react"
import type { Metadata } from "next"
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

// 2. 🚀 SEO METADATA (The "Identity Card" for Google)
export const metadata: Metadata = {
  title: {
    default: "CyberScan AI - Free Threat Intelligence & URL Scanner",
    template: "%s | CyberScan AI"
  },
  description: "Detect phishing links, analyze malware, and learn cybersecurity. Free AI-powered URL scanner, dark web monitor, and educational labs.",
  keywords: ["cybersecurity scanner", "phishing detector", "malware analysis", "osint tools", "CTF practice", "learn hacking", "url scanner"],
  authors: [{ name: "CyberScan Team" }],
  creator: "CyberScan AI",
  
  // 3. Smart Icons (Your existing logic + SEO standard)
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },

  // 4. Social Media Cards (Open Graph) - Makes links look good on WhatsApp/Twitter
  openGraph: {
    title: "CyberScan AI",
    description: "Next-Gen AI Threat Detection. Scan URLs, Files, and IPs instantly.",
    url: "https://securityx.in",
    siteName: "CyberScan AI",
    images: [
      {
        url: "/og-image.png", // Ensure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: "CyberScan AI Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 5. Search Engine Verification (Paste your codes here later)
  verification: {
    google: "ob1uQivcBWJLBn8m46x3zjZfUnPdZFCqwOoV0lC1vsU", 
    yandex: "yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      {/* Added font variables so Geist fonts actually work */}
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