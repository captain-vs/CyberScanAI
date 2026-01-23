import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface User {
  recentActivity: any
  id: string
  email: string
  name: string
  createdAt: string
  stats: {
    scansCompleted: number
    quizzesCompleted: number
    challengesCompleted: number
    points: number
    level: number
  }
  achievements: string[]
}

// Global cache
let cachedUser: User | null = null

export function getUser() {
  return cachedUser
}

// 🔥 CRITICAL FIX: Keep cachedUser in sync on reload
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const userRef = doc(db, "users", firebaseUser.uid)
      const snap = await getDoc(userRef)
      if (snap.exists()) {
        cachedUser = snap.data() as User
      }
    } catch (e) {
      console.error("Auth sync error:", e)
    }
  } else {
    cachedUser = null
  }
})

/* ================= SIGN UP ================= */
export async function signUp(email: string, password: string, name: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    const userRef = doc(db, "users", cred.user.uid)

    const userData: User = {
      id: cred.user.uid,
      email,
      name,
      createdAt: new Date().toISOString(),
      stats: {
        scansCompleted: 0,
        quizzesCompleted: 0,
        challengesCompleted: 0,
        points: 0,
        level: 1,
      },
      achievements: [],
      recentActivity: [],
    }

    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    })

    cachedUser = userData
    return { success: true }
  } catch (error: any) {
    console.error("SIGN UP ERROR:", error)
    return { success: false, error: error.message }
  }
}

/* ================= SIGN IN ================= */
export async function signIn(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, "users", cred.user.uid)
    const snap = await getDoc(userRef)

    // ✅ AUTO-FIX: create profile if missing
    if (!snap.exists()) {
      const newUser: User = {
        id: cred.user.uid,
        email: cred.user.email || email,
        name: cred.user.displayName || "User",
        createdAt: new Date().toISOString(),
        stats: {
          scansCompleted: 0,
          quizzesCompleted: 0,
          challengesCompleted: 0,
          points: 0,
          level: 1,
        },
        achievements: [],
        recentActivity: [],
      }

      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
      })

      cachedUser = newUser
      return { success: true }
    }

    cachedUser = snap.data() as User
    return { success: true }
  } catch (error: any) {
    console.error("SIGN IN ERROR:", error)
    return { success: false, error: error.message }
  }
}

/* ================= GOOGLE LOGIN ================= */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)

    const ref = doc(db, "users", cred.user.uid)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      const newUser: User = {
        id: cred.user.uid,
        email: cred.user.email!,
        name: cred.user.displayName || "Google User",
        createdAt: new Date().toISOString(),
        stats: {
          scansCompleted: 0,
          quizzesCompleted: 0,
          challengesCompleted: 0,
          points: 0,
          level: 1,
        },
        achievements: [],
        recentActivity: [],
      }

      await setDoc(ref, {
        ...newUser,
        createdAt: serverTimestamp(),
      })

      cachedUser = newUser
    } else {
      cachedUser = snap.data() as User
    }

    return { success: true }
  } catch (err: any) {
    console.error("GOOGLE SIGN IN ERROR:", err)
    return { success: false, error: err.message }
  }
}

/* ================= LOGOUT ================= */
export async function logout() {
  cachedUser = null
  await signOut(auth)
}