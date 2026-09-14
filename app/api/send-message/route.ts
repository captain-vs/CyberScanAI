import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Initialize Firebase Admin (Download your private key json from Firebase Console > Project Settings > Service Accounts)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminDb = getFirestore();
const adminMessaging = getMessaging();

export async function POST(req: Request) {
  try {
    const { senderUid, receiverUid, senderName, text } = await req.json();

    // 1. Save message to Firestore
    const messageRef = await adminDb.collection("messages").add({
      senderUid,
      receiverUid,
      senderName,
      text,
      read: false,
      createdAt: new Date(),
    });

    // 2. Fetch recipient's FCM token
    const userDoc = await adminDb.collection("users").doc(receiverUid).get();
    if (userDoc.exists) {
      const fcmToken = userDoc.data()?.fcmToken;

      if (fcmToken) {
        // 3. Send push notification instantly
        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: `New Message from ${senderName}`,
            body: text,
          },
        });
      }
    }

    return NextResponse.json({ success: true, id: messageRef.id });
  } catch (error) {
    console.error("Error sending message and push:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}