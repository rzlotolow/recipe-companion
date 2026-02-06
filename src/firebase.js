import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
 apiKey: "AIzaSyCIdrEMLuAubSY6WCTlz30z29Wt1dUcIE8",
 authDomain: "recipe-companion-4ef23.firebaseapp.com",
 projectId: "recipe-companion-4ef23",
 storageBucket: "recipe-companion-4ef23.firebasestorage.app",
 messagingSenderId: "1033904698389",
 appId: "1:1033904698389:web:7aa64a0bb091a8ba430a1c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
