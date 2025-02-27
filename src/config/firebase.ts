import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase configuration from the Firebase Console
// Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyAAWUQFOupw0_ImCGrfUYBMCFiQ_Z6aWDI",
  authDomain: "wmsb2c-e238a.firebaseapp.com",
  projectId: "wmsb2c-e238a",
  storageBucket: "wmsb2c-e238a.firebasestorage.app",
  messagingSenderId: "611477723753",
  appId: "1:611477723753:web:03fdd31f5e8de7683d20f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/*
Firestore Security Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /habits/{habitId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
*/ 