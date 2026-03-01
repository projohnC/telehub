import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGWiWgQSO50Xkc5jPxwKsYZly8LkS_qbQ",
  authDomain: "streanhub.firebaseapp.com",
  projectId: "streanhub",
  storageBucket: "streanhub.firebasestorage.app",
  messagingSenderId: "1094179481028",
  appId: "1:1094179481028:web:14db1ed22533ab40cd7091",
  measurementId: "G-SKZ6PRDH63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and Firestore with the app instance
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
