import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcEk7ql9xhCefCVgkKm4GhoQwnoybLg2M",
  authDomain: "tripsync-80368.firebaseapp.com",
  projectId: "tripsync-80368",
  storageBucket: "tripsync-80368.appspot.com",
  messagingSenderId: "461682188392",
  appId: "1:461682188392:web:da5c0e78a9b8d54d079bdd",
  measurementId: "G-3G7216W79S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
