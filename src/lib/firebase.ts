import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBiNS0PC3riN4ozo4xqRPUK-x19_K_dK7I",
  authDomain: "brijesh-10602.firebaseapp.com",
  projectId: "brijesh-10602",
  storageBucket: "brijesh-10602.firebasestorage.app",
  messagingSenderId: "487266936456",
  appId: "1:487266936456:web:1e02cc6017f0d9b475e13d",
  measurementId: "G-QPPGRXV6GP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
