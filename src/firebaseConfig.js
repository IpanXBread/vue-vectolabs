
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDQHlf7Mu0fPBr09Oz6OEFhnPWKRGGXJx0',
  authDomain: 'vue-vectolabs2.firebaseapp.com',
  projectId: 'vue-vectolabs2',
  storageBucket: 'vue-vectolabs2.appspot.com',
  messagingSenderId: '393732203291',
  appId: '1:393732203291:web:175b163394cc230afb29be',
  measurementId: 'G-3RX3MSCVK6'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app);

export { db }
