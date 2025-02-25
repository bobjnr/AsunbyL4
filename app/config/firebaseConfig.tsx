// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDXEJfAcsLPU6m25X7Z-syRJ8bP4q-xw3g",
    authDomain: "asunbyl4-fb95d.firebaseapp.com",
    projectId: "asunbyl4-fb95d",
    storageBucket: "asunbyl4-fb95d.firebasestorage.app",
    messagingSenderId: "1034262411934",
    appId: "1:1034262411934:web:f1fa62981546aca22fd98f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);