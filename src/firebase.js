import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "filefolder-54946.firebaseapp.com",
  projectId: "filefolder-54946",
  storageBucket: "filefolder-54946.appspot.com",
  messagingSenderId: "1016654651914",
  appId: "1:1016654651914:web:552cc88f977c5470d9b5f3"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
