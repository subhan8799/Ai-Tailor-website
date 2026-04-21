import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "dummy-api-key",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "dummy-project",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:000000000000:web:dummy",
};

let auth = null;
let googleProvider = null;

try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
} catch (err) {
    console.warn('Firebase not configured. Google Sign-In disabled.');
}

export { auth, googleProvider };
