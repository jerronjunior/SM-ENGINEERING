import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { db } from '../config/firebase.js'
import { authMiddleware } from './admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()
const localProjectsPath = path.join(__dirname, '../config/projects.json')

const uploadDir = path.join(__dirname, '../uploads/projects')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const readLocalProjects = () => {
  try {
    if (!fs.existsSync(localProjectsPath)) return []
    const data = JSON.parse(fs.readFileSync(localProjectsPath, 'utf8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const writeLocalProjects = (projects) => {
  fs.writeFileSync(localProjectsPath, JSON.stringify(projects, null, 2), 'utf8')
}

const toDateValue = (value) => {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

// Public: get all projects
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('projects').orderBy('createdAt', 'desc').get()
    const projects = snap.docs.map((d) => {
      const data = d.data()
      return { id: d.id, ...data, createdAt: toDateValue(data.createdAt) }
    })
    res.json(projects)
  } catch (err) {
    console.warn('Failed to fetch projects from Firestore, using local fallback.', err?.message)
    const projects = readLocalProjects().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(projects)
  }
})

// Public: get single project
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('projects').doc(req.params.id).get()
    if (!doc.exists) return res.status(404).json({ error: 'Project not found' })
    const data = doc.data()
    res.json({ id: doc.id, ...data, createdAt: toDateValue(data.createdAt) })
  } catch (err) {
    console.warn('Failed to fetch project from Firestore, using local fallback.', err?.message)
    const project = readLocalProjects().find((p) => p.id === req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  }
})

// Admin: create project
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, type, status, beforeAfter } = req.body
    const images = (req.files || []).map(f => `/api/uploads/projects/${f.filename}`)
    const payload = {
      title: title || 'Untitled Project',
      description: description || '',
      type: type || 'residential',
      status: status || 'completed',
      beforeAfter: beforeAfter === 'true' || beforeAfter === true,
      images,
      createdAt: new Date(),
    }

    try {
      const doc = await db.collection('projects').add(payload)
      return res.status(201).json({ id: doc.id, message: 'Project created', storage: 'firestore' })
    } catch (firestoreErr) {
      console.warn('Failed to create project in Firestore, saving locally.', firestoreErr?.message)
    }

    const projects = readLocalProjects()
    const localDoc = {
      id: `local-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    }
    projects.unshift(localDoc)
    writeLocalProjects(projects)
    res.status(201).json({ id: localDoc.id, message: 'Project created', storage: 'local-file' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// Admin: update project
router.put('/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const newImages = (req.files || []).map(f => `/api/uploads/projects/${f.filename}`)

    try {
      const ref = db.collection('projects').doc(req.params.id)
      const existing = (await ref.get()).data()
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
      return res.json({ message: 'Project updated', storage: 'firestore' })
    } catch (firestoreErr) {
      console.warn('Failed to update project in Firestore, using local fallback.', firestoreErr?.message)
    }

    const projects = readLocalProjects()
    const index = projects.findIndex((p) => p.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Project not found' })

    const existing = projects[index]
    const images = req.body.keepImages ? [...(existing?.images || []), ...newImages] : newImages.length ? newImages : (existing?.images || [])
    projects[index] = {
      ...existing,
      title: req.body.title ?? existing?.title,
      description: req.body.description ?? existing?.description,
      type: req.body.type ?? existing?.type,
      status: req.body.status ?? existing?.status,
      beforeAfter: req.body.beforeAfter === 'true' || req.body.beforeAfter === true,
      images,
      updatedAt: new Date().toISOString(),
    }
    writeLocalProjects(projects)
    res.json({ message: 'Project updated', storage: 'local-file' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// Admin: delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    try {
      await db.collection('projects').doc(req.params.id).delete()
      return res.json({ message: 'Project deleted', storage: 'firestore' })
    } catch (firestoreErr) {
      console.warn('Failed to delete project in Firestore, using local fallback.', firestoreErr?.message)
    }

    const projects = readLocalProjects()
    const nextProjects = projects.filter((p) => p.id !== req.params.id)
    if (nextProjects.length === projects.length) return res.status(404).json({ error: 'Project not found' })
    writeLocalProjects(nextProjects)
    res.json({ message: 'Project deleted', storage: 'local-file' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
