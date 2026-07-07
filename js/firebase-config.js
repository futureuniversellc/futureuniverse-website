/* ============================================================
   FUTURE UNIVERSE — FIREBASE CONFIGURATION
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyB1UY0ZIUSXUc_JyIsUrBxIgTCz6GX5hWA",
  authDomain: "futureuniversedb.firebaseapp.com",
  projectId: "futureuniversedb",
  storageBucket: "futureuniversedb.firebasestorage.app",
  messagingSenderId: "716956066404",
  appId: "1:716956066404:web:26ca4c3d7ab5fb32dff571"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// References
const db = firebase.firestore();
const auth = firebase.auth();
