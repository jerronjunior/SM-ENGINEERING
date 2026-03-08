import express from 'express'
import { db } from '../config/firebase.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' })
    }
    const doc = await db.collection('contacts').add({
      name,
      email,
      phone: phone || '',
      subject: subject || '',
      message,
      read: false,
      createdAt: new Date(),
    })
    res.status(201).json({ id: doc.id, message: 'Message sent successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save message' })
  }
})

export default router
