// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiCUtHy6oE4ljjou0uxhZERgQ38ar6DdU",
  authDomain: "capitaes-48bab.firebaseapp.com",
  projectId: "capitaes-48bab",
  storageBucket: "capitaes-48bab.firebasestorage.app",
  messagingSenderId: "535964867514",
  appId: "1:535964867514:web:6fd22b7f612d550732db83",
  measurementId: "G-7CX4YQEBXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;

// Analytics só funciona no navegador
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics, firebaseConfig };
