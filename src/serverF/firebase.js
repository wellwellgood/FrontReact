// src/serverF/firebase.js
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(firebaseConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
} else {
  app = getApps()[0]; // 이미 초기화된 앱 재사용
}

export const bucket = getStorage().bucket();
