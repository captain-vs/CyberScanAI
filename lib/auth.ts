import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface UserProfile {
  id: string
  email: string
  name: string
  photoURL?: string
  createdAt: string
  stats: {
    scanned: number
    points: number
    level: number
    rank: number
  }
  achievements: string[]
  recentActivity: any[]
  role: "student" | "admin"
}

// Global cache for instant access
let cachedUser: UserProfile | null = null

export function getUser() {
  return cachedUser
}

// 🔥 SYNC: Keep cachedUser updated automatically on reload
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const userRef = doc(db, "users", firebaseUser.uid)
      const snap = await getDoc(userRef)
      if (snap.exists()) {
        cachedUser = snap.data() as UserProfile
      }
    } catch (e) {
      console.error("Auth sync warning:", e)
    }
  } else {
    cachedUser = null
  }
})

/* ================= HELPER: DEFAULT USER DATA ================= */
const createDefaultUser = (user: FirebaseUser, name?: string): UserProfile => ({
  id: user.uid,
  email: user.email || "",
  name: name || user.displayName || "Agent",
  photoURL: user.photoURL || "",
  createdAt: new Date().toISOString(),
  role: "student",
  stats: {
    scanned: 0,
    points: 0,
    level: 1,
    rank: 0
  },
  achievements: [],
  recentActivity: []
})

/* ================= SIGN UP (EMAIL) ================= */
export async function signUp(email: string, password: string, name: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, "users", cred.user.uid)
    
    const newUser = createDefaultUser(cred.user, name)

    await setDoc(userRef, {
      ...newUser,
      createdAt: serverTimestamp(),
    })

    cachedUser = newUser
    return { success: true }
  } catch (error: any) {
    console.error("SIGN UP ERROR:", error)
    return { success: false, error: error.message }
  }
}

/* ================= SIGN IN (EMAIL) ================= */
export async function signIn(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, "users", cred.user.uid)
    const snap = await getDoc(userRef)

    // ✅ AUTO-FIX: Create profile if missing (Self-Healing)
    if (!snap.exists()) {
      const newUser = createDefaultUser(cred.user)
      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
      })
      cachedUser = newUser
    } else {
      cachedUser = snap.data() as UserProfile
    }

    return { success: true }
  } catch (error: any) {
    console.error("SIGN IN ERROR:", error)
    return { success: false, error: error.message }
  }
}

/* ================= GOOGLE LOGIN (POPUP) ================= */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider()
    // Ensure we get the basic info
    provider.addScope('email') 
    provider.addScope('profile')

    // ⚡ USE POPUP (Redirect causes issues on some mobile webviews)
    const cred = await signInWithPopup(auth, provider)
    
    const userRef = doc(db, "users", cred.user.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) {
      // Create new Google User Profile
      const newUser = createDefaultUser(cred.user)
      
      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
      })
      cachedUser = newUser
    } else {
      // Existing user
      cachedUser = snap.data() as UserProfile
    }

    return { success: true }
  } catch (err: any) {
    console.error("GOOGLE SIGN IN ERROR:", err)
    
    // Handle "Popup closed by user" gracefully
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: "Login cancelled" }
    }
    
    return { success: false, error: err.message }
  }
}

export async function resetPassword(email: string) {
  try {
    // This tells Firebase to automatically send the secure reset link!
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/* ================= LOGOUT ================= */
export async function logout() {
  cachedUser = null
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}