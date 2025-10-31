import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDNQEa_xZEqWSFozpoHK5Z3FAiIuiyNRQs",
  authDomain: "shortcak-es.firebaseapp.com",
  projectId: "shortcak-es",
  storageBucket: "shortcak-es.firebasestorage.app",
  messagingSenderId: "834175067279",
  appId: "1:834175067279:web:a9865537a51641cb423cfa",
  measurementId: "G-YWPJQFC839"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);