import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBsEMdnEy--NkL4JhwZUpHknTRmlu-A-UA",
  authDomain: "noxbynoel-f4b31.firebaseapp.com",
  projectId: "noxbynoel-f4b31",
  storageBucket: "noxbynoel-f4b31.firebasestorage.app",
  messagingSenderId: "443755748610",
  appId: "1:443755748610:web:9d45b238854ebf6eee761b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);