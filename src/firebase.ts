// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {  getFirestore } from "firebase/firestore";
import {  getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD9zwlRbRXfYvN1oS2smypPcHcOaP_ZNtg",
    authDomain: "healthmate-25baa.firebaseapp.com",
    projectId: "healthmate-25baa",
    storageBucket: "healthmate-25baa.firebasestorage.app",
    messagingSenderId: "577650098524",
    appId: "1:577650098524:web:85506515a4ad10da118199",
    measurementId: "G-5RDY260S2M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const db = getFirestore(app);
export const storage = getStorage(app); // Export the storage instance

export { db };