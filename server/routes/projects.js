import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { db } from '../config/firebase.js'
import { authMiddleware } from './admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()

const uploadDir = path.join(__dirname, '../uploads/projects')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// Public: get all projects
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('projects').orderBy('createdAt', 'desc').get()
    const projects = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() }))
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// Public: get single project
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('projects').doc(req.params.id).get()
    if (!doc.exists) return res.status(404).json({ error: 'Project not found' })
    const data = doc.data()
    res.json({ id: doc.id, ...data, createdAt: data.createdAt?.toDate?.() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// Admin: create project
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, type, status, beforeAfter } = req.body
    const images = (req.files || []).map(f => `/api/uploads/projects/${f.filename}`)
    const doc = await db.collection('projects').add({
      title: title || 'Untitled Project',
      description: description || '',
      type: type || 'residential',
      status: status || 'completed',
      beforeAfter: beforeAfter === 'true' || beforeAfter === true,
      images,
      createdAt: new Date(),
    })
    res.status(201).json({ id: doc.id, message: 'Project created' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// Admin: update project
router.put('/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const ref = db.collection('projects').doc(req.params.id)
    const existing = (await ref.get()).data()
    const newImages = (req.files || []).map(f => `/api/uploads/projects/${f.filename}`)
    const images = req.body.keepImages ? [...(existing?.images || []), ...newImages] : newImages.length ? newImages : (existing?.images || [])

    await ref.update({
      title: req.body.title ?? existing?.title,
      description: req.body.description ?? existing?.description,
      type: req.body.type ?? existing?.type,
      status: req.body.status ?? existing?.status,
      beforeAfter: req.body.beforeAfter === 'true' || req.body.beforeAfter === true,
      images,
      updatedAt: new Date(),
    })
    res.json({ message: 'Project updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// Admin: delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.collection('projects').doc(req.params.id).delete()
    res.json({ message: 'Project deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
