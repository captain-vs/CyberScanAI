"use client"

import { useEffect, useState } from "react"

export function WebAdBanner() {
  const [showAd, setShowAd] = useState(false)

  useEffect(() => {
    // Check if the app is running as a standalone desktop container (Microsoft Store wrapper)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window as any).navigator.standalone === true

    // If it's NOT standalone (meaning it's a regular browser), allow ads to show
    if (!isStandalone) {
      setShowAd(true)
      
      // Load Google AdSense script dynamically only in the browser
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      } catch (err) {
        console.error("AdSense error:", err)
      }
    }
  }, [])

  // If it's running inside the Microsoft Store app, render nothing to protect your account!
  if (!showAd) return null

  return (
    <div className="my-4 flex justify-center overflow-hidden">
      {/* Google AdSense Unit */}
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', maxWidth: '728px', height: '90px' }}
           data-ad-client="ca-pub-6753717364472113"
           data-ad-slot="3310024691"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  )
}