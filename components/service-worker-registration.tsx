"use client"
import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Delay registration to let the app paint the UI first
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .catch(err => console.error('Service worker registration failed:', err));
      });
    }
  }, [])
  return null
}