import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOGrlBmGVEs5TQt-8BtjWGEsmX3d8W4KY",
  authDomain: "sixtysecnews-49789.firebaseapp.com",
  projectId: "sixtysecnews-49789",
  storageBucket: "sixtysecnews-49789.firebasestorage.app",
  messagingSenderId: "899984434470",
  appId: "1:899984434470:web:90898b6f18243c54d88de7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);