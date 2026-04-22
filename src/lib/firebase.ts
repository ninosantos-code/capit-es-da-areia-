// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8SPRQNnQzCrP6gggGfhl_oee3qmziYFo",
  authDomain: "gen-lang-client-0391067705.firebaseapp.com",
  projectId: "gen-lang-client-0391067705",
  storageBucket: "gen-lang-client-0391067705.firebasestorage.app",
  messagingSenderId: "662842664020",
  appId: "1:662842664020:web:fe8e08aa1b0c24b150b9c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;

// Analytics só funciona no navegador
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics, firebaseConfig };
