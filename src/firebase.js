// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDFUcn5puuR-DqSOL8OPChQiGyYNfVYttU",
    authDomain: "itwordleboard.firebaseapp.com",
    projectId: "itwordleboard",
    storageBucket: "itwordleboard.appspot.com",
    messagingSenderId: "96048580751",
    appId: "1:96048580751:web:5f0b3e3761a2b9f48888fa",
    measurementId: "G-LJ7W4GGRSX"
  };

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };