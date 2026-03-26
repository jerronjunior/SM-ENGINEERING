import express from 'express'
import { db } from '../config/firebase.js'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@smengconstruction.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'change-this-admin-token-secret'
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24
const ADMIN_SETTINGS_COLLECTION = 'settings'
const ADMIN_SETTINGS_DOC = 'adminAuth'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localAuthPath = path.join(__dirname, '../config/admin-auth.json')
const localContactsPath = path.join(__dirname, '../config/contacts.json')

const readLocalContacts = () => {
  try {
    if (!fs.existsSync(localContactsPath)) return []
    const data = JSON.parse(fs.readFileSync(localContactsPath, 'utf8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const writeLocalContacts = (contacts) => {
  fs.writeFileSync(localContactsPath, JSON.stringify(contacts, null, 2), 'utf8')
}

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const verifyPassword = (password, encoded) => {
  const [salt, originalHash] = (encoded || '').split(':')
  const hexPattern = /^[a-f0-9]+$/i
  if (!salt || !originalHash || !hexPattern.test(salt) || !hexPattern.test(originalHash)) return false

  try {
    const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex')
    const derivedBuffer = Buffer.from(derivedHash, 'hex')
    const originalBuffer = Buffer.from(originalHash, 'hex')
    if (derivedBuffer.length === 0 || originalBuffer.length === 0) return false
    if (derivedBuffer.length !== originalBuffer.length) return false
    return crypto.timingSafeEqual(derivedBuffer, originalBuffer)
  } catch {
    return false
  }
}

const hasValidPasswordHashFormat = (encoded) => {
  const [salt, hash] = (encoded || '').split(':')
  const hexPattern = /^[a-f0-9]+$/i
  if (!salt || !hash) return false
  if (!hexPattern.test(salt) || !hexPattern.test(hash)) return false
  if (salt.length % 2 !== 0 || hash.length % 2 !== 0) return false
  return true
}

const getAdminAuthConfig = async () => {
  try {
    const doc = await db.collection(ADMIN_SETTINGS_COLLECTION).doc(ADMIN_SETTINGS_DOC).get()
    const data = doc.data()
    if (doc.exists && data?.email && data?.passwordHash && hasValidPasswordHashFormat(data.passwordHash)) {
      return { email: data.email, passwordHash: data.passwordHash }
    }
    if (doc.exists && data?.passwordHash && !hasValidPasswordHashFormat(data.passwordHash)) {
      console.warn('Ignoring invalid admin password hash format in Firestore, using env fallback.')
    }
  } catch (err) {
    console.warn('Failed to load admin auth config from Firestore, using env fallback.', err?.message)
  }

  try {
    if (fs.existsSync(localAuthPath)) {
      const localData = JSON.parse(fs.readFileSync(localAuthPath, 'utf8'))
      if (localData?.email && localData?.passwordHash && hasValidPasswordHashFormat(localData.passwordHash)) {
        return { email: localData.email, passwordHash: localData.passwordHash }
      }
      if (localData?.passwordHash && !hasValidPasswordHashFormat(localData.passwordHash)) {
        console.warn('Ignoring invalid local admin password hash format, using env fallback.')
      }
    }
  } catch (err) {
    console.warn('Failed to load local admin auth config, using env fallback.', err?.message)
  }

  return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
}

const saveAdminAuthConfig = async ({ email, passwordHash }) => {
  try {
    await db.collection(ADMIN_SETTINGS_COLLECTION).doc(ADMIN_SETTINGS_DOC).set(
      {
        email,
        passwordHash,
        updatedAt: new Date(),
      },
      { merge: true }
    )
    return { target: 'firestore' }
  } catch (err) {
    console.warn('Failed to save admin auth config to Firestore, saving locally.', err?.message)
  }

  fs.writeFileSync(
    localAuthPath,
    JSON.stringify(
      {
        email,
        passwordHash,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  )

  return { target: 'local-file' }
}

const matchesPassword = (password, authConfig) => {
  if (authConfig.passwordHash) return verifyPassword(password, authConfig.passwordHash)
  return password === authConfig.password
}

const createToken = (email) => {
  const payload = {
    email,
    issuedAt: Date.now(),
    expiresAt: Date.now() + TOKEN_TTL_MS,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(encodedPayload).digest('base64url')
  return `${encodedPayload}.${signature}`
}

const parseToken = (token) => {
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const expectedSignature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(encodedPayload).digest('base64url')
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)
  if (signatureBuffer.length !== expectedSignatureBuffer.length) return null
  const isValid = crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  if (!isValid) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
    if (!payload?.email || !payload?.expiresAt || Date.now() > payload.expiresAt) return null
    return payload
  } catch {
    return null
  }
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const authConfig = await getAdminAuthConfig()
    if (email === authConfig.email && matchesPassword(password, authConfig)) {
      const token = createToken(email)
      res.json({ success: true, token })
      return
    }
    res.status(401).json({ success: false, error: 'Invalid credentials' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Failed to login' })
  }
})

const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const payload = parseToken(auth.slice(7))
    if (!payload) return res.status(401).json({ error: 'Unauthorized' })

    const authConfig = await getAdminAuthConfig()
    if (payload.email !== authConfig.email) return res.status(401).json({ error: 'Unauthorized' })

    req.admin = payload
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, email: req.admin.email })
})

router.put('/credentials', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, newEmail } = req.body || {}

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' })
    }

    if (!newPassword && !newEmail) {
      return res.status(400).json({ error: 'Provide a new password or new email' })
    }

    const authConfig = await getAdminAuthConfig()
    const isCurrentPasswordValid = matchesPassword(currentPassword, authConfig)
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    if (newPassword && newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    const nextEmail = (newEmail || authConfig.email).trim()
    const nextPasswordHash = newPassword
      ? hashPassword(newPassword)
      : authConfig.passwordHash || hashPassword(authConfig.password)

    const saveResult = await saveAdminAuthConfig({
      email: nextEmail,
      passwordHash: nextPasswordHash,
    })

    const token = createToken(nextEmail)
    res.json({
      success: true,
      token,
      email: nextEmail,
      storage: saveResult.target,
      message: 'Credentials updated successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update credentials' })
  }
})

router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const snap = await db.collection('contacts').orderBy('createdAt', 'desc').get()
    const contacts = snap.docs.map(d => {
      const data = d.data()
      return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() }
    })
    res.json(contacts)
  } catch (err) {
    console.warn('Failed to fetch contacts from Firestore, using local fallback.', err?.message)
    const contacts = readLocalContacts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(contacts)
  }
})

router.patch('/contacts/:id/read', authMiddleware, async (req, res) => {
  try {
    await db.collection('contacts').doc(req.params.id).update({ read: true })
    res.json({ message: 'Marked as read' })
  } catch (err) {
    console.warn('Failed to update contact in Firestore, using local fallback.', err?.message)
    const contacts = readLocalContacts()
    const index = contacts.findIndex((c) => c.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Message not found' })
    }
    contacts[index] = { ...contacts[index], read: true }
    writeLocalContacts(contacts)
    res.json({ message: 'Marked as read' })
  }
})

export default router
export { authMiddleware }
