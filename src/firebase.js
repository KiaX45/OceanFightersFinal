// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
//Imports de la parte de base de datos 
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdWekX_-lqvk2C3oIfqZrS3AP47VI9wtM",
  authDomain: "ocean-ad72b.firebaseapp.com",
  projectId: "ocean-ad72b",
  storageBucket: "ocean-ad72b.appspot.com",
  messagingSenderId: "281485647696",
  appId: "1:281485647696:web:e9a73b9e7f435a0851d655",
  measurementId: "G-GM174SCRJG",
};

// Initialize Firebase


// Initialize Firebase
export const app = initializeApp(firebaseConfig);

//Usuarios
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

//FireStore
const db = getFirestore(app); // lo que decimos es que una ves importado el medio de getFirestore le pasamos por parametro nuestra app para que sepa donde conectarse 

export{auth, provider, db};
