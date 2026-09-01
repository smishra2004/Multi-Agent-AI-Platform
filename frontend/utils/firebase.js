// Import the functions you need from the SDKs you need
import { getApp, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_URL,
  authDomain: "cortexai-e60f7.firebaseapp.com",
  projectId: "cortexai-e60f7",
  storageBucket: "cortexai-e60f7.firebasestorage.app",
  messagingSenderId: "45840314632",
  appId: "1:45840314632:web:0f05b83c0b5eade8fb3cbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider();