import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../../api/client'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/admin/login', { email, password })
      if (res.success && res.token) {
        localStorage.setItem('adminToken', res.token)
        navigate('/admin/dashboard')
      } else {
        setError('Invalid response')
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-blue-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-xl bg-brand-blue border border-brand-green/20"
      >
        <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
        <p className="text-gray-400 text-sm mb-6">SM Engineering & Construction</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-brand-blue-dark border border-brand-green/30 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-brand-green text-white font-semibold hover:bg-brand-green-light disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <Link to="/" className="block text-center text-brand-green-accent text-sm mt-4 hover:underline">Back to website</Link>
      </motion.div>
    </div>
  )
}
