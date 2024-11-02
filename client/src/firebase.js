// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDYQELHIQl9MV_-MJg1eV86PoVP3vXpoA",
  authDomain: "tigerhacks2024-terra.firebaseapp.com",
  projectId: "tigerhacks2024-terra",
  storageBucket: "tigerhacks2024-terra.firebasestorage.app",
  messagingSenderId: "826255283083",
  appId: "1:826255283083:web:fcd4e85a7395195e76158e",
  measurementId: "G-0VVSNZW4S6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;