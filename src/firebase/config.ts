import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyB6HZkYwoDT0PZfSFyuAL7SU3nLHy5iVcY",
  authDomain: "fir-blog-6f05e.firebaseapp.com",
  projectId: "fir-blog-6f05e",
  storageBucket: "fir-blog-6f05e.firebasestorage.app",
  messagingSenderId: "185114133970",
  appId: "1:185114133970:web:d857ae0c04d45f5ec8740b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

export { db }

