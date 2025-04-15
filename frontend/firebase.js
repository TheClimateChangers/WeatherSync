// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcEk7ql9xhCefCVgkKm4GhoQwnoybLg2M",
  authDomain: "tripsync-80368.firebaseapp.com",
  projectId: "tripsync-80368",
  storageBucket: "tripsync-80368.firebasestorage.app",
  messagingSenderId: "461682188392",
  appId: "1:461682188392:web:da5c0e78a9b8d54d079bdd",
  measurementId: "G-3G7216W79S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };