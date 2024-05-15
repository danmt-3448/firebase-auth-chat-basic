import {getAnalytics} from 'firebase/analytics'
import {initializeApp} from 'firebase/app'
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCAeoh3Swgbc725WTJQ2aoyv4PMc4qKpBY',
  authDomain: 'login-with-f1881.firebaseapp.com',
  projectId: 'login-with-f1881',
  storageBucket: 'login-with-f1881.appspot.com',
  messagingSenderId: '836709196881',
  appId: '1:836709196881:web:17de39211956e8b04f0470',
  measurementId: 'G-01L4D9PB8E',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const firestore = getFirestore(app)
const storage = getStorage(app)

export {analytics, app, auth, firestore, storage}
