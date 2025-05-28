// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8p-0qo8-MOASxvNlcXkO7Rd1j75u3cXo",
  authDomain: "baranggay-resident-info-system.firebaseapp.com",
  projectId: "baranggay-resident-info-system",
  storageBucket: "baranggay-resident-info-system.firebasestorage.app",
  messagingSenderId: "452903140392",
  appId: "1:452903140392:web:f316147f8a1b7d2a89891d",
  measurementId: "G-F5NP90CPSY"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);



export const auth = getAuth(app);
export const db = getFirestore(app);


