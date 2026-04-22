// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVWPV39_jYk3ZQgPatl3KZK0SyybtYFEs",
  authDomain: "capitaesdaareia-8cd73.firebaseapp.com",
  projectId: "capitaesdaareia-8cd73",
  storageBucket: "capitaesdaareia-8cd73.firebasestorage.app",
  messagingSenderId: "849754146663",
  appId: "1:849754146663:web:be53ff7af02a84692c11c2",
  measurementId: "G-WPQSJ6L32H"
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
