// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoRBViUbD7MSGC_2jxged-fBjGkOQC1So",
  authDomain: "filefolder-54946.firebaseapp.com",
  projectId: "filefolder-54946",
  storageBucket: "filefolder-54946.firebasestorage.app",
  messagingSenderId: "1016654651914",
  appId: "1:1016654651914:web:552cc88f977c5470d9b5f3",
  measurementId: "G-HNXRF6QV2R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { storage };