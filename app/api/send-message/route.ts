import { NextResponse } from "next/server"
import { z } from "zod"
import { adminAuth, adminDb, adminMessaging } from "@/lib/server/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
const messageSchema = z.object({
  receiverUid: z.string().min(1).max(128),
  text: z.string().trim().min(1).max(2000),
})

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const token = authorization.slice(7)
    const sender = await adminAuth.verifyIdToken(token)
    const { receiverUid, text } = messageSchema.parse(await req.json())

    if (sender.uid === receiverUid) {
      return NextResponse.json({ error: "Cannot message yourself." }, { status: 400 })
    }

    const receiver = await adminDb.collection("users").doc(receiverUid).get()

    if (!receiver.exists) {
      return NextResponse.json({ error: "Recipient not found." }, { status: 404 })
    }

    const senderProfile = await adminDb.collection("users").doc(sender.uid).get()
    const senderName = senderProfile.data()?.name || sender.email || "SecurityX user"

    const messageRef = await adminDb.collection("messages").add({
      senderUid: sender.uid,
      receiverUid,
      senderName,
      text,
      read: false,
      timestamp: FieldValue.serverTimestamp(),
    })

    const fcmToken = receiver.data()?.fcmToken

    if (fcmToken) {
  try {
    await adminMessaging.send({
      token: fcmToken,
      notification: {
        title: `Message from ${senderName}`,
        body: text.slice(0, 140),
      },
    })
  } catch (notificationError) {
    console.warn("Push notification was not sent:", notificationError)
  }
}

    return NextResponse.json({ success: true, id: messageRef.id })
  } catch {
    return NextResponse.json(
      { error: "Unable to send message." },
      { status: 400 },
    )
  }
}