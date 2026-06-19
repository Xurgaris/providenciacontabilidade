
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCKqpE1brE6kHYmvJrKMVfpI3AJmyh61zM",
  authDomain: "contabilidadecampoverde-416cf.firebaseapp.com",
  projectId: "contabilidadecampoverde-416cf",
  storageBucket: "contabilidadecampoverde-416cf.firebasestorage.app",
  messagingSenderId: "207228669111",
  appId: "1:207228669111:web:d59374813554d0180f9132",
  measurementId: "G-4TLY1TMJFN"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "southamerica-east1");