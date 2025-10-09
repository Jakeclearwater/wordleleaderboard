// src/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// Import environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Disable Firebase analytics and performance monitoring
if (typeof window !== 'undefined') {
    // Disable Analytics data collection
    window['ga-disable-' + firebaseConfig.measurementId] = true;
    
    // Set Firebase Analytics to not collect data
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = false;
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to reduce network traffic and metrics
const firestore = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED, // Unlimited cache to reduce network calls
    experimentalForceLongPolling: false, // Use WebChannel for better performance
    experimentalAutoDetectLongPolling: true, // Auto-detect best connection method
});

export { firestore };