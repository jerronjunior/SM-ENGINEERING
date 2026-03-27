import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { db } from '../config/firebase.js'
import { authMiddleware } from './admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()
const localBlogPath = path.join(__dirname, '../config/blog.json')

const uploadDir = path.join(__dirname, '../uploads/blog')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const readLocalPosts = () => {
  try {
    if (!fs.existsSync(localBlogPath)) return []
    const data = JSON.parse(fs.readFileSync(localBlogPath, 'utf8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const writeLocalPosts = (posts) => {
  fs.writeFileSync(localBlogPath, JSON.stringify(posts, null, 2), 'utf8')
}

const toDateValue = (value) => {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('blog').orderBy('createdAt', 'desc').get()
    const posts = snap.docs.map(d => {
      const data = d.data()
      return { id: d.id, ...data, createdAt: toDateValue(data.createdAt) }
    })
    res.json(posts)
  } catch (err) {
    console.warn('Failed to fetch blog posts from Firestore, using local fallback.', err?.message)
    const posts = readLocalPosts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(posts)
  }
})

router.get('/slug/:slug', async (req, res) => {
  try {
    const snap = await db.collection('blog').where('slug', '==', req.params.slug).limit(1).get()
    if (snap.empty) return res.status(404).json({ error: 'Post not found' })
    const doc = snap.docs[0]
    const data = doc.data()
    res.json({ id: doc.id, ...data, createdAt: toDateValue(data.createdAt) })
  } catch (err) {
    console.warn('Failed to fetch blog post from Firestore, using local fallback.', err?.message)
    const post = readLocalPosts().find((p) => p.slug === req.params.slug)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json(post)
  }
})

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content } = req.body
    const slug = slugify(title || 'untitled')
    const image = req.file ? `/api/uploads/blog/${req.file.filename}` : ''
    const payload = {
      title: title || 'Untitled',
      excerpt: excerpt || '',
      content: content || '',
      slug,
      image,
      createdAt: new Date(),
    }

    try {
      const doc = await db.collection('blog').add(payload)
      return res.status(201).json({ id: doc.id, slug, message: 'Post created', storage: 'firestore' })
    } catch (firestoreErr) {
      console.warn('Failed to create blog post in Firestore, saving locally.', firestoreErr?.message)
    }

    const posts = readLocalPosts()
    const localDoc = {
      id: `local-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    }
    posts.unshift(localDoc)
    writeLocalPosts(posts)
    res.status(201).json({ id: localDoc.id, slug, message: 'Post created', storage: 'local-file' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
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
      return res.json({ message: 'Post updated', storage: 'firestore' })
    } catch (firestoreErr) {
      console.warn('Failed to update blog post in Firestore, using local fallback.', firestoreErr?.message)
    }

    const posts = readLocalPosts()
    const index = posts.findIndex((p) => p.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Post not found' })

    const existing = posts[index]
    const title = req.body.title ?? existing?.title
    const slug = req.body.slug || slugify(title)
    const image = req.file ? `/api/uploads/blog/${req.file.filename}` : (existing?.image || '')
    posts[index] = {
      ...existing,
      title,
      excerpt: req.body.excerpt ?? existing?.excerpt,
      content: req.body.content ?? existing?.content,
      slug,
      image: image || existing?.image,
      updatedAt: new Date().toISOString(),
    }
    writeLocalPosts(posts)
    res.json({ message: 'Post updated', storage: 'local-file' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    try {
      await db.collection('blog').doc(req.params.id).delete()
      return res.json({ message: 'Post deleted', storage: 'firestore' })
    } catch (firestoreErr) {
      console.warn('Failed to delete blog post in Firestore, using local fallback.', firestoreErr?.message)
    }

    const posts = readLocalPosts()
    const nextPosts = posts.filter((p) => p.id !== req.params.id)
    if (nextPosts.length === posts.length) return res.status(404).json({ error: 'Post not found' })
    writeLocalPosts(nextPosts)
    res.json({ message: 'Post deleted', storage: 'local-file' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

export default router
