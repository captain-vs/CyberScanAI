import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getDatabase } from "firebase/database"; // <-- Added import

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
let app;
try {
  if (!firebaseConfig.apiKey) {
    throw new Error("FIREBASE_API_KEY is missing from .env.local");
  }
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("✅ Firebase App initialized successfully");
} catch (error) {
  console.error("❌ Firebase App initialization failed:", error);
}

// 2. ENABLE OFFLINE PERSISTENCE with Error Handling
let db;
try {
  if (app) {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log("✅ Firestore Persistence enabled");
  }
} catch (error) {
  console.error("⚠️ Firestore Persistence failed, falling back to default:", error);
  db = getFirestore(app!);
}

// 3. ENABLE PERSISTENT AUTH
let auth;
try {
  if (app) {
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).then(() => {
      console.log("✅ Auth Persistence set to LOCAL");
    }).catch((error) => {
      console.error("❌ Auth Persistence Error:", error);
    });
  }
} catch (error) {
  console.error("❌ Auth initialization failed:", error);
}

// 4. ENABLE REALTIME DATABASE EXPORT
let database: any = null;
try {
  if (app) {
    database = getDatabase(app);
    console.log("✅ Realtime Database initialized successfully");
  }
} catch (error) {
  console.error("❌ Realtime Database initialization failed:", error);
}

export { auth, db, database };