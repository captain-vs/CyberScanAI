// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 1. Initialize App with validation
let app: any = null;
try {
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ FIREBASE_API_KEY is missing from environment variables.");
  }
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("❌ Firebase App initialization failed:", error);
}

// 2. ENABLE OFFLINE PERSISTENCE (Client-side browser only check)
let db: any = null;
try {
  if (app) {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  }
} catch (error) {
  // Fallback to standard firestore if persistence fails or runs in SSR
  try {
    db = getFirestore(app);
  } catch (fallbackError) {
    console.warn("⚠️ Firestore initialization warning:", fallbackError);
  }
}

// 3. ENABLE PERSISTENT AUTH
let auth: any = null;
try {
  if (app) {
    auth = getAuth(app);
    if (typeof window !== "undefined") {
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn("⚠️ Auth Persistence warning:", error);
      });
    }
  }
} catch (error) {
  console.warn("⚠️ Auth initialization warning:", error);
}

// 4. ENABLE REALTIME DATABASE
let database: any = null;
try {
  if (app) {
    database = getDatabase(app);
  }
} catch (error) {
  console.warn("⚠️ Realtime Database initialization warning:", error);
}

// 5. ENABLE FIREBASE MESSAGING (Client-side notifications)
let messaging: any = null;
if (app && typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        messaging = getMessaging(app);
      } catch (err) {
        console.warn("⚠️ Messaging support warning:", err);
      }
    }
  }).catch(() => {
    // Ignore messaging support check failures on unsupported browsers
  });
}

export { auth, db, database, messaging };