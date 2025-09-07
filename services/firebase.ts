// FIX: Switched to Firebase v9 compat syntax to resolve the module import error.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDz-NK5zb45-y5FYLbOHqMmYymotcET0gI",
  authDomain: "gemin-pro-ex.firebaseapp.com",
  projectId: "gemin-pro-ex",
  storageBucket: "gemin-pro-ex.firebasestorage.app",
  messagingSenderId: "340611478020",
  appId: "1:340611478020:web:2b9f6ae7f0b34b0de8bb51",
  measurementId: "G-Y3MLN18HJ3"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export const auth = firebase.auth();
export const db = firebase.firestore();
export const googleProvider = new firebase.auth.GoogleAuthProvider();