// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUpGAm8-DhJmfKbJqqk9-eTPqPi6m10Uk",
    authDomain: "brisita-a1263.firebaseapp.com",
    projectId: "brisita-a1263",
    storageBucket: "brisita-a1263.firebasestorage.app",
    messagingSenderId: "644935940758",
    appId: "1:644935940758:web:c284d0c0c3d22a5c4f20b7",
    measurementId: "G-LME5ECH2W9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

console.log('Firebase initialized successfully');
