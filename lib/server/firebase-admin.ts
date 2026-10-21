// lib/server/firebase-admin.ts
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getMessaging } from "firebase-admin/messaging"

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

if (!rawServiceAccount) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not configured in environment variables.")
}

let serviceAccount: any

try {
  // Sanitize formatting and quotes from Vercel environment variables
  const sanitizedKey = rawServiceAccount.trim().replace(/^['"](.*)['"]$/, '$1')
  serviceAccount = JSON.parse(sanitizedKey)
  
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }
} catch (error) {
  throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON. Check your Vercel environment variable format.")
}

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert(serviceAccount),
  })

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminMessaging = getMessaging(adminApp)