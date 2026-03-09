import admin from 'firebase-admin'

const initFirebase = () => {
  if (admin.apps.length > 0) return admin.app()

  const projectId = process.env.FIREBASE_PROJECT_ID || 'sm-engineering-dcea3'
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials are missing. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in server/.env.'
    )
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

initFirebase()
export const db = admin.firestore()
