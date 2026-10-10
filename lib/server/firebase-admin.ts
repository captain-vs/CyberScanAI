import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getMessaging } from "firebase-admin/messaging"

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

if (!rawServiceAccount) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not configured.")
}

const serviceAccount = JSON.parse(
  rawServiceAccount.replace(/\\n/g, "\n"),
)

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert(serviceAccount),
  })

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminMessaging = getMessaging(adminApp)