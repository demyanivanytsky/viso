// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from 'firebase/firestore';


export const firebaseConfig = {
  apiKey: "AIzaSyD3GRCxmfo1ndrOYhTitMy8k3BQM6fbOpE",
  authDomain: "my-technical-viso.firebaseapp.com",
  projectId: "my-technical-viso",
  storageBucket: "my-technical-viso.appspot.com",
  messagingSenderId: "798686547171",
  appId: "1:798686547171:web:1f0b33dd3ce3d56fad49d6",
  measurementId: "G-C9NSSRJ0RF"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
