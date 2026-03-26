import express from 'express'
import { db } from '../config/firebase.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
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

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' })
    }
    const payload = {
      name,
      email,
      phone: phone || '',
      subject: subject || '',
      message,
      read: false,
      createdAt: new Date(),
    }

    try {
      const doc = await db.collection('contacts').add(payload)
      return res.status(201).json({ id: doc.id, message: 'Message sent successfully', storage: 'firestore' })
    } catch (firestoreErr) {
      console.warn('Failed to save contact to Firestore, saving locally.', firestoreErr?.message)
    }

    const contacts = readLocalContacts()
    const localDoc = {
      id: `local-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    }
    contacts.unshift(localDoc)
    writeLocalContacts(contacts)
    res.status(201).json({ id: localDoc.id, message: 'Message sent successfully', storage: 'local-file' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save message' })
  }
})

export default router
