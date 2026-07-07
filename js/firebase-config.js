/* ============================================================
   FUTURE UNIVERSE — FIREBASE CONFIGURATION
   Replace the placeholder values below with your Firebase
   project credentials from https://console.firebase.google.com
   ============================================================ */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// References
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();
