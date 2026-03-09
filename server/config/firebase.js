import admin from 'firebase-admin'

const initFirebase = () => {
  if (admin.apps.length > 0) return admin.app()

  const projectId = process.env.FIREBASE_PROJECT_ID || 'sm-engineering-dcea3'
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  }

  console.warn('Firebase Admin service-account credentials are not set. Falling back to application default credentials.')
  return admin.initializeApp({
    projectId,
    credential: admin.credential.applicationDefault(),
  })
}

initFirebase()
export const db = admin.firestore()
