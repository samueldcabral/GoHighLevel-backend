import firebase from "firebase/app";
import "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ6ICry00USqSHFrff-Rh1tsFEjed_hgQ",
  authDomain: "gonextlevel-c6ad6.firebaseapp.com",
  databaseURL: "https://gonextlevel-c6ad6.firebaseio.com",
  projectId: "gonextlevel-c6ad6",
  storageBucket: "gonextlevel-c6ad6.appspot.com",
  messagingSenderId: "631852326926",
  appId: "1:631852326926:web:baf2e7914c3c7e0a559c5f",
  measurementId: "G-C8VN14PWNB",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// const firebaseDB = firebase.database();
const db = firebase.firestore();
// const firebaseEvents = firebaseDB.ref("seek");

export { db };
