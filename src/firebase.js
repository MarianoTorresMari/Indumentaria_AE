import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDTVkT9c8oXYRfQxvbcHiNzzwxpZC-rxOQ",
  authDomain: "indumentariaae-333a9.firebaseapp.com",
  projectId: "indumentariaae-333a9",
  storageBucket: "indumentariaae-333a9.firebasestorage.app",
  messagingSenderId: "222688415322",
  appId: "1:222688415322:web:2866547ef41aa1d1f81263",
  measurementId: "G-ES71TXZGLX"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
