import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

const serviceAccount = JSON.parse(
  readFileSync(
    path.resolve("src/serverF/firebaseServiceKey.json"), // 🔑 네 서비스 계정 json 경로
    "utf-8"
  )
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "filefolder-54946.appspot.com",
  });
}

const bucket = admin.storage().bucket();
export { bucket };