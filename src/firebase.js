import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAdGBRVGuhclrAlg_4seRfUXuv5sFGkMFg",
  authDomain: "medivault-4a06c.firebaseapp.com",
  projectId: "medivault-4a06c",
  storageBucket: "medivault-4a06c.firebasestorage.app",
  messagingSenderId: "81637313149",
  appId: "1:81637313149:web:ae390c7a53c2f118677f14"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
