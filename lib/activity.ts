"use client"

import { auth, db } from "@/lib/firebase"
import {
  doc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
  runTransaction
} from "firebase/firestore"

export type ActivityType = "scan" | "quiz" | "challenge" | "lab"

interface RecordActivityInput {
  type: ActivityType
  description: string
  points: number
}

// 🧮 HELPER: Calculate Level Threshold (Doubles every level)
// Level 1: 1000, Level 2: 2000, Level 3: 4000, Level 4: 8000...
export const getLevelThreshold = (level: number) => {
  return 1000 * Math.pow(2, level - 1)
}

export async function recordActivity({
  type,
  description,
  points,
}: RecordActivityInput) {
  const user = auth.currentUser
  if (!user) return

  const userRef = doc(db, "users", user.uid)
  const activityRef = collection(db, "users", user.uid, "activity")

  try {
    await runTransaction(db, async (transaction) => {
      // 1️⃣ Read current user stats
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) throw "User does not exist!"

      const userData = userDoc.data()
      const currentStats = userData.stats || { points: 0, level: 1 }
      
      const newPoints = (currentStats.points || 0) + points
      let currentLevel = currentStats.level || 1
      let nextThreshold = getLevelThreshold(currentLevel)

      // 2️⃣ Level Up Logic (Loop in case big points bump multiple levels)
      while (newPoints >= nextThreshold) {
        currentLevel++
        nextThreshold = getLevelThreshold(currentLevel)
      }

      // 3️⃣ Prepare Stats Update
      const statsUpdate: any = {
        "stats.points": newPoints,
        "stats.level": currentLevel,
      }

      if (type === "quiz") statsUpdate["stats.quizzesCompleted"] = increment(1)
      if (type === "challenge") statsUpdate["stats.challengesCompleted"] = increment(1)
      if (type === "scan") statsUpdate["stats.scansCompleted"] = increment(1)

      // 4️⃣ Commit Updates
      transaction.update(userRef, statsUpdate)
      
      // 5️⃣ Add Activity Log
      const newActivityRef = doc(activityRef)
      transaction.set(newActivityRef, {
        type,
        description,
        points,
        timestamp: serverTimestamp(),
      })
    })

    // 6️⃣ Notify UI
    window.dispatchEvent(new CustomEvent("userStatsUpdated"))

  } catch (e) {
    console.error("Transaction failed: ", e)
  }
}