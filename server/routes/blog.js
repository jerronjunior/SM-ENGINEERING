import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { db } from '../config/firebase.js'
import { authMiddleware } from './admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()

const uploadDir = path.join(__dirname, '../uploads/blog')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('blog').orderBy('createdAt', 'desc').get()
    const posts = snap.docs.map(d => {
      const data = d.data()
      return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() }
    })
    res.json(posts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

router.get('/slug/:slug', async (req, res) => {
  try {
    const snap = await db.collection('blog').where('slug', '==', req.params.slug).limit(1).get()
    if (snap.empty) return res.status(404).json({ error: 'Post not found' })
    const doc = snap.docs[0]
    const data = doc.data()
    res.json({ id: doc.id, ...data, createdAt: data.createdAt?.toDate?.() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch post' })
  }
})

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content } = req.body
    const slug = slugify(title || 'untitled')
    const image = req.file ? `/api/uploads/blog/${req.file.filename}` : ''
    const doc = await db.collection('blog').add({
      title: title || 'Untitled',
      excerpt: excerpt || '',
      content: content || '',
      slug,
      image,
      createdAt: new Date(),
    })
    res.status(201).json({ id: doc.id, slug, message: 'Post created' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const ref = db.collection('blog').doc(req.params.id)
    const existing = (await ref.get()).data()
    const title = req.body.title ?? existing?.title
    const slug = req.body.slug || slugify(title)
    const image = req.file ? `/api/uploads/blog/${req.file.filename}` : (existing?.image || '')

    await ref.update({
      title,
      excerpt: req.body.excerpt ?? existing?.excerpt,
      content: req.body.content ?? existing?.content,
      slug,
      image: image || existing?.image,
      updatedAt: new Date(),
    })
    res.json({ message: 'Post updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.collection('blog').doc(req.params.id).delete()
    res.json({ message: 'Post deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

export default router
