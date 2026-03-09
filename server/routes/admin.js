import express from 'express'
import { db } from '../config/firebase.js'
import crypto from 'crypto'

const router = express.Router()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@smengconstruction.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'change-this-admin-token-secret'
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24

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
  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  if (!isValid) return null

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
  if (!payload?.email || !payload?.expiresAt || Date.now() > payload.expiresAt) return null
  return payload
}

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = createToken(email)
    res.json({ success: true, token })
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' })
  }
})

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = parseToken(auth.slice(7))
    if (!payload) return res.status(401).json({ error: 'Unauthorized' })
    if (payload.email !== ADMIN_EMAIL) return res.status(401).json({ error: 'Unauthorized' })
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, email: req.admin.email })
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
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

router.patch('/contacts/:id/read', authMiddleware, async (req, res) => {
  try {
    await db.collection('contacts').doc(req.params.id).update({ read: true })
    res.json({ message: 'Marked as read' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update' })
  }
})

export default router
export { authMiddleware }
