// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBqIaZkeXq7tHx97YG75KuY8nAYNDfcUjk",
  authDomain: "clean-abode-474615-p4.firebaseapp.com",
  projectId: "clean-abode-474615-p4",
  storageBucket: "clean-abode-474615-p4.firebasestorage.app",
  messagingSenderId: "516537477717",
  appId: "1:516537477717:web:275f01503f3a08027002dc"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const title = payload.notification?.title || "SecurityX Alert";
  const options = {
    body: payload.notification?.body || "New operator message received.",
    icon: "/favicon.ico"
  };

  if ('setAppBadge' in navigator) {
    navigator.setAppBadge(1).catch((err) => console.log("Badge error:", err));
  }

  self.registration.showNotification(title, options);
});