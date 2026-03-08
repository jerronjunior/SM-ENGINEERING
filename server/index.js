import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import contactRoutes from './routes/contact.js'
import projectRoutes from './routes/projects.js'
import blogRoutes from './routes/blog.js'
import adminRoutes from './routes/admin.js'
import chatRoutes from './routes/chat.js'
import contentRoutes from './routes/content.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/contact', contactRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/content', contentRoutes)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
