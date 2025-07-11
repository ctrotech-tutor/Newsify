import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2pBJz83cObPIYhiOp86mM2B1F4Jz3bBY",
  authDomain: "newsify-37961.firebaseapp.com",
  databaseURL: "https://newsify-37961-default-rtdb.firebaseio.com",
  projectId: "newsify-37961",
  storageBucket: "newsify-37961.firebasestorage.app",
  messagingSenderId: "946828159805",
  appId: "1:946828159805:web:f2b577915e23b95a61b354",
  measurementId: "G-WG4CNZ1JZP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };

