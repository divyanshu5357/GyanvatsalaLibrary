import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app = null
let auth = null
let db = null
let storage = null

const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId
if (hasConfig) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    
    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('⚠️ Multiple tabs: persistence disabled')
      } else if (err.code === 'unimplemented') {
        // Current browser doesn't support persistence
        console.warn('⚠️ Persistence not supported in this browser')
      }
    })
    
    storage = getStorage(app)
    
    // eslint-disable-next-line no-console
    console.log('✅ Firebase initialized successfully')
    console.log('   Project ID:', firebaseConfig.projectId)
    console.log('   Auth Domain:', firebaseConfig.authDomain)
    console.log('   API Key:', firebaseConfig.apiKey.substring(0, 20) + '...')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Firebase initialization error:', err.message, err.code)
  }
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '❌ Firebase config missing. Required env vars not set. Create a .env file with VITE_FIREBASE_* variables (see .env.example) and restart the dev server.'
  )
}

// small helper to test Firestore REST connectivity
async function testFirestoreConnectivity() {
  if (!firebaseConfig.projectId) return { ok: false, error: 'missing projectId' }
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents?pageSize=1`
  try {
    const res = await fetch(url)
    const text = await res.text()
    return { ok: res.ok, status: res.status, body: text }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

// Log config (only keys, not secrets) to help debugging during development
/* eslint-disable no-console */
console.log('Firebase config preview:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
})
/* eslint-enable no-console */

export { auth, db, storage, testFirestoreConnectivity }
