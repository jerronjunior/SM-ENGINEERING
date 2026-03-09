import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineFolder, HiOutlineDocumentText, HiOutlineMail, HiOutlineLogout, HiOutlinePencil, HiOutlineTrash, HiOutlineKey } from 'react-icons/hi'
import { api } from '../../api/client'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('contacts')
  const [contacts, setContacts] = useState([])
  const [projects, setProjects] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [projectForm, setProjectForm] = useState({ title: '', description: '', type: 'residential', status: 'completed', beforeAfter: false, images: null })
  const [postForm, setPostForm] = useState({ title: '', excerpt: '', content: '', image: null })
  const [editingProject, setEditingProject] = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [credentialsForm, setCredentialsForm] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [credentialsMessage, setCredentialsMessage] = useState('')
  const [credentialsError, setCredentialsError] = useState('')
  const [updatingCredentials, setUpdatingCredentials] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin')
      return
    }
    loadData()
  }, [navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [c, p, b] = await Promise.all([
        api.get('/admin/contacts'),
        api.get('/projects'),
        api.get('/blog'),
      ])
      setContacts(c)
      setProjects(p)
      setPosts(b)
    } catch (err) {
      if (err.message === 'Unauthorized') {
        localStorage.removeItem('adminToken')
        navigate('/admin')
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin')
  }

  const markRead = async (id) => {
    try {
      await api.patch(`/admin/contacts/${id}/read`, {})
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, read: true } : c)))
    } catch {}
  }

  const createProject = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', projectForm.title)
    formData.append('description', projectForm.description)
    formData.append('type', projectForm.type)
    formData.append('status', projectForm.status)
    formData.append('beforeAfter', projectForm.beforeAfter)
    if (projectForm.images) for (const f of projectForm.images) formData.append('images', f)
    try {
      await api.post('/projects', formData)
      setProjectForm({ title: '', description: '', type: 'residential', status: 'completed', beforeAfter: false, images: null })
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const updateProject = async (e) => {
    e.preventDefault()
    if (!editingProject) return
    const formData = new FormData()
    formData.append('title', projectForm.title)
    formData.append('description', projectForm.description)
    formData.append('type', projectForm.type)
    formData.append('status', projectForm.status)
    formData.append('beforeAfter', projectForm.beforeAfter)
    formData.append('keepImages', 'true')
    if (projectForm.images) for (const f of projectForm.images) formData.append('images', f)
    try {
      await api.put(`/projects/${editingProject.id}`, formData)
      setEditingProject(null)
      setProjectForm({ title: '', description: '', type: 'residential', status: 'completed', beforeAfter: false, images: null })
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await api.delete(`/projects/${id}`)
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const createPost = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', postForm.title)
    formData.append('excerpt', postForm.excerpt)
    formData.append('content', postForm.content)
    if (postForm.image) formData.append('image', postForm.image)
    try {
      await api.post('/blog', formData)
      setPostForm({ title: '', excerpt: '', content: '', image: null })
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const updatePost = async (e) => {
    e.preventDefault()
    if (!editingPost) return
    const formData = new FormData()
    formData.append('title', postForm.title)
    formData.append('excerpt', postForm.excerpt)
    formData.append('content', postForm.content)
    if (postForm.image) formData.append('image', postForm.image)
    try {
      await api.put(`/blog/${editingPost.id}`, formData)
      setEditingPost(null)
      setPostForm({ title: '', excerpt: '', content: '', image: null })
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/blog/${id}`)
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const updateCredentials = async (e) => {
    e.preventDefault()
    setCredentialsError('')
    setCredentialsMessage('')

    const { currentPassword, newEmail, newPassword, confirmPassword } = credentialsForm
    if (!newEmail && !newPassword) {
      setCredentialsError('Enter a new email or new password.')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setCredentialsError('New password and confirm password do not match.')
      return
    }

    setUpdatingCredentials(true)
    try {
      const res = await api.put('/admin/credentials', {
        currentPassword,
        newEmail: newEmail || undefined,
        newPassword: newPassword || undefined,
      })

      if (res?.token) {
        localStorage.setItem('adminToken', res.token)
      }

      setCredentialsForm({
        currentPassword: '',
        newEmail: '',
        newPassword: '',
        confirmPassword: '',
      })
      setCredentialsMessage('Admin credentials updated successfully.')
    } catch (err) {
      setCredentialsError(err.message || 'Failed to update credentials.')
      if (err.message === 'Unauthorized') {
        localStorage.removeItem('adminToken')
        navigate('/admin')
      }
    } finally {
      setUpdatingCredentials(false)
    }
  }

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '')

  if (loading && !contacts.length && !projects.length) {
    return (
      <div className="min-h-screen bg-brand-blue-dark flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-blue-dark">
      <header className="sticky top-0 z-10 bg-brand-blue border-b border-brand-green/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-brand-green-accent text-sm hover:underline">← Site</Link>
          <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <HiOutlineLogout /> Logout
        </button>
      </header>

      <div className="flex flex-col md:flex-row">
        <aside className="md:w-56 border-b md:border-b-0 md:border-r border-brand-green/20 p-4 flex md:flex-col gap-2">
          {[
            { id: 'contacts', label: 'Messages', icon: HiOutlineMail },
            { id: 'projects', label: 'Projects', icon: HiOutlineFolder },
            { id: 'blog', label: 'Blog', icon: HiOutlineDocumentText },
            { id: 'settings', label: 'Settings', icon: HiOutlineKey },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left ${tab === t.id ? 'bg-brand-green text-white' : 'text-gray-400 hover:bg-brand-blue'}`}
            >
              <t.icon /> {t.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {tab === 'contacts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Contact form messages</h2>
              {contacts.length === 0 ? (
                <p className="text-gray-400">No messages yet.</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-lg border ${c.read ? 'border-brand-blue-light bg-brand-blue/50' : 'border-brand-green/30 bg-brand-blue'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{c.name}</p>
                          <p className="text-sm text-gray-400">{c.email} {c.phone && ` • ${c.phone}`}</p>
                          {c.subject && <p className="text-sm text-brand-green-accent">{c.subject}</p>}
                          <p className="text-gray-300 mt-2">{c.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(c.createdAt)}</p>
                        </div>
                        {!c.read && (
                          <button onClick={() => markRead(c.id)} className="text-xs text-brand-green-accent hover:underline">Mark read</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'projects' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Projects</h2>
              <form onSubmit={editingProject ? updateProject : createProject} className="p-4 rounded-xl bg-brand-blue border border-brand-green/20 space-y-3 max-w-lg">
                <h3 className="text-white font-medium">{editingProject ? 'Edit project' : 'Add project'}</h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                />
                <textarea
                  placeholder="Description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white resize-none"
                />
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={projectForm.type}
                    onChange={(e) => setProjectForm((f) => ({ ...f, type: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm((f) => ({ ...f, status: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                  >
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                  <label className="flex items-center gap-2 text-gray-400">
                    <input
                      type="checkbox"
                      checked={projectForm.beforeAfter}
                      onChange={(e) => setProjectForm((f) => ({ ...f, beforeAfter: e.target.checked }))}
                      className="rounded"
                    />
                    Before/After
                  </label>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setProjectForm((f) => ({ ...f, images: e.target.files }))}
                  className="w-full text-sm text-gray-400"
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium">
                    {editingProject ? 'Update' : 'Add'}
                  </button>
                  {editingProject && (
                    <button type="button" onClick={() => { setEditingProject(null); setProjectForm({ title: '', description: '', type: 'residential', status: 'completed', beforeAfter: false, images: null }); }} className="px-4 py-2 rounded-lg border border-gray-500 text-gray-400 text-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="grid gap-3">
                {projects.map((p) => (
                  <div key={p.id} className="p-4 rounded-lg bg-brand-blue border border-brand-green/20 flex flex-col sm:flex-row sm:items-center gap-3">
                    {p.images?.[0] && (
                      <img src={API_BASE + p.images[0]} alt="" className="w-20 h-20 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{p.title}</p>
                      <p className="text-sm text-gray-400 truncate">{p.description}</p>
                      <p className="text-xs text-brand-green-accent">{p.type} • {p.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProject(p)
                          setProjectForm({ title: p.title, description: p.description || '', type: p.type || 'residential', status: p.status || 'completed', beforeAfter: p.beforeAfter || false, images: null })
                        }}
                        className="p-2 rounded text-gray-400 hover:text-white hover:bg-brand-blue-light"
                      >
                        <HiOutlinePencil />
                      </button>
                      <button onClick={() => deleteProject(p.id)} className="p-2 rounded text-gray-400 hover:text-red-400 hover:bg-brand-blue-light">
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'blog' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Blog posts</h2>
              <form onSubmit={editingPost ? updatePost : createPost} className="p-4 rounded-xl bg-brand-blue border border-brand-green/20 space-y-3 max-w-lg">
                <h3 className="text-white font-medium">{editingPost ? 'Edit post' : 'Add post'}</h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={postForm.title}
                  onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                />
                <input
                  type="text"
                  placeholder="Excerpt"
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                />
                <textarea
                  placeholder="Content (plain text or HTML)"
                  value={postForm.content}
                  onChange={(e) => setPostForm((f) => ({ ...f, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white resize-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPostForm((f) => ({ ...f, image: e.target.files?.[0] }))}
                  className="w-full text-sm text-gray-400"
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium">
                    {editingPost ? 'Update' : 'Add'}
                  </button>
                  {editingPost && (
                    <button type="button" onClick={() => { setEditingPost(null); setPostForm({ title: '', excerpt: '', content: '', image: null }); }} className="px-4 py-2 rounded-lg border border-gray-500 text-gray-400 text-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="grid gap-3">
                {posts.map((p) => (
                  <div key={p.id} className="p-4 rounded-lg bg-brand-blue border border-brand-green/20 flex flex-col sm:flex-row sm:items-center gap-3">
                    {p.image && <img src={API_BASE + p.image} alt="" className="w-20 h-20 object-cover rounded" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{p.title}</p>
                      <p className="text-sm text-gray-400 truncate">{p.excerpt}</p>
                      <p className="text-xs text-brand-green-accent">{p.slug} • {formatDate(p.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPost(p)
                          setPostForm({ title: p.title, excerpt: p.excerpt || '', content: p.content || '', image: null })
                        }}
                        className="p-2 rounded text-gray-400 hover:text-white hover:bg-brand-blue-light"
                      >
                        <HiOutlinePencil />
                      </button>
                      <button onClick={() => deletePost(p.id)} className="p-2 rounded text-gray-400 hover:text-red-400 hover:bg-brand-blue-light">
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-xl">
              <h2 className="text-xl font-semibold text-white">Admin Settings</h2>
              <form onSubmit={updateCredentials} className="p-4 rounded-xl bg-brand-blue border border-brand-green/20 space-y-3">
                <h3 className="text-white font-medium">Change email or password</h3>
                <p className="text-sm text-gray-400">Current password is required to save changes.</p>

                <input
                  type="password"
                  placeholder="Current password"
                  value={credentialsForm.currentPassword}
                  onChange={(e) => setCredentialsForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                />

                <input
                  type="email"
                  placeholder="New email (optional)"
                  value={credentialsForm.newEmail}
                  onChange={(e) => setCredentialsForm((f) => ({ ...f, newEmail: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                />

                <input
                  type="password"
                  placeholder="New password (optional, min 6 chars)"
                  value={credentialsForm.newPassword}
                  onChange={(e) => setCredentialsForm((f) => ({ ...f, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={credentialsForm.confirmPassword}
                  onChange={(e) => setCredentialsForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white"
                />

                {credentialsError && <p className="text-red-400 text-sm">{credentialsError}</p>}
                {credentialsMessage && <p className="text-brand-green-accent text-sm">{credentialsMessage}</p>}

                <button
                  type="submit"
                  disabled={updatingCredentials}
                  className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium disabled:opacity-60"
                >
                  {updatingCredentials ? 'Saving...' : 'Update credentials'}
                </button>
              </form>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
