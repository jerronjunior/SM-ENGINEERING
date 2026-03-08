import express from 'express'
import { db } from '../config/firebase.js'

const router = express.Router()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@smengconstruction.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = Buffer.from(JSON.stringify({ email, time: Date.now() })).toString('base64')
    res.json({ success: true, token })
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' })
  }
})

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = JSON.parse(Buffer.from(auth.slice(7), 'base64').toString())
    if (payload.email !== ADMIN_EMAIL) return res.status(401).json({ error: 'Unauthorized' })
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

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
