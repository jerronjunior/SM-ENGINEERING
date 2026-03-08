import express from 'express'
import { db } from '../config/firebase.js'
import { authMiddleware } from './admin.js'

const router = express.Router()

router.get('/:key', async (req, res) => {
  try {
    const doc = await db.collection('websiteContent').doc(req.params.key).get()
    if (!doc.exists) return res.json(null)
    res.json(doc.data())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch content' })
  }
})

router.put('/:key', authMiddleware, async (req, res) => {
  try {
    await db.collection('websiteContent').doc(req.params.key).set(
      { ...req.body, updatedAt: new Date() },
      { merge: true }
    )
    res.json({ message: 'Content updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update content' })
  }
})

export default router
