import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

// 1. Initialize App (Singleton Pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// 2. ENABLE OFFLINE PERSISTENCE (The Speed Fix)
// Instead of simple getFirestore(), we use initializeFirestore with cache settings.
// This works for both Chrome (Web) and Android WebView (App).
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

// 3. ENABLE PERSISTENT AUTH (The Login Fix)
// This ensures the user stays logged in even if the app closes or refreshes.
const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth Persistence Error:", error)
})

export { auth, db }