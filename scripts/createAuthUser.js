/**
 * Script to create a Firebase Auth user using the Admin SDK and set their UID to match
 * a pre-created Firestore user document. This is intended to be run on a secure machine.
 *
 * Usage:
 * 1. Place your service account JSON in the same folder and name it `serviceAccountKey.json`.
 * 2. node createAuthUser.js <uid> <email> <password> "Full Name"
 */

const admin = require('firebase-admin')
const fs = require('fs')

const serviceAccountPath = './serviceAccountKey.json'
if (!fs.existsSync(serviceAccountPath)) {
  console.error('serviceAccountKey.json not found. Get it from Firebase Console → Project Settings → Service accounts')
  process.exit(1)
}

const serviceAccount = require(serviceAccountPath)
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const auth = admin.auth()
const db = admin.firestore()

async function main() {
  const [,, uid, email, password, ...nameParts] = process.argv
  const name = nameParts.join(' ') || 'Student'
  if (!uid || !email || !password) {
    console.error('Usage: node createAuthUser.js <uid> <email> <password> "Full Name"')
    process.exit(1)
  }

  try {
    const user = await auth.createUser({ uid, email, password, displayName: name })
    console.log('Created auth user:', user.uid)
    // Optionally set a flag in Firestore
    await db.collection('users').doc(uid).set({ authCreated: true }, { merge: true })
    console.log('Updated Firestore users/' + uid)
  } catch (err) {
    console.error('Error creating auth user:', err)
    process.exit(1)
  }
}

main()
