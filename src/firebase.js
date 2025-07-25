import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCoRBViUbD7MSGC_2jxged-fBjGkOQC1So",
  authDomain: "filefolder-54946.firebaseapp.com",
  projectId: "filefolder-54946",
  storageBucket: "gs://filefolder-54946.appspot.com", // ← 수정됨
  messagingSenderId: "1016654651914",
  appId: "1:1016654651914:web:552cc88f977c5470d9b5f3",
  measurementId: "G-HNXRF6QV2R"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

export { storage };
