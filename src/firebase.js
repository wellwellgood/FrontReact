import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCoRBViUbD7MSGC_2jxged-fBjGkOQC1So",
  authDomain: "filefolder-54946.firebaseapp.com",
  projectId: "filefolder-54946",
  storageBucket: "filefolder-54946.appspot.com",
  messagingSenderId: "1016654651914",
  appId: "1:1016654651914:web:552cc88f977c5470d9b5f3"
};

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

export { storage };