import { getMessaging, getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function requestNotificationPermission(userId: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Register the service worker we created earlier in public/
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: 'BBzwPNDeRPPBdDyPNcOp94M_1Ht9QqpPmf3wuvHaTe7hcCb9D15geG0xbQurw4tR05de9jqQpYBJGlyhpu__mtE',
        serviceWorkerRegistration: registration
      });

      if (token && userId) {
        // Save the unique device token under the user's Firestore document
        await setDoc(doc(db, "users", userId), { fcmToken: token }, { merge: true });
        console.log("FCM Token saved successfully for background push.");
      }
    }
  } catch (error) {
    console.error("Error setting up push notifications:", error);
  }
}