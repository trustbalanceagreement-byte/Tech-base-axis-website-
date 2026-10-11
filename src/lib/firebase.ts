import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8or3ZTFZ3cJcEZxd1Mkwc6KzVdKfKW0w",
  authDomain: "my-portfolio-website-d9419.firebaseapp.com",
  projectId: "my-portfolio-website-d9419",
  storageBucket: "my-portfolio-website-d9419.firebasestorage.app",
  messagingSenderId: "255850470009",
  appId: "1:255850470009:web:a5462ac66b3b35284dd2a8",
  measurementId: "G-5ZNTBQ0XX8"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  type User
};
