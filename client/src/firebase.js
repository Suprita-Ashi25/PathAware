import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYsKxhSqVlrWixRpTJB1IJhZVr3nhdJXc87",
  authDomain: "pathaware-7a1bc.firebaseapp.com",
  projectId: "pathaware-7a1bc",
  storageBucket: "pathaware-7a1bc.firebasestorage.app",
  messagingSenderId: "711583552117",
  appId: "1:711583552117:web:b6b2462b7737473c775e3c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);