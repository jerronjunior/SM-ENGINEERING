import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiOutlineDocumentText } from 'react-icons/hi'
import { api } from '../api/client'
import SectionHeading from '../components/SectionHeading'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/blog')
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) => {
    if (!d) return ''
    const date = d instanceof Date ? d : new Date(d)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <Helmet>
        <title>Blog | SM Engineering & Construction</title>
        <meta name="description" content="Articles and updates from SM Engineering & Construction on construction, planning, and design." />
      </Helmet>

      <section className="py-24 page-hero relative">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" style={{ backgroundSize: '48px 48px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4"
          >
            Insights
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            Updates and insights from our team.
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-xl bg-brand-blue animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 rounded-2xl section-card"
            >
              <div className="w-20 h-20 rounded-2xl bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlineDocumentText className="text-5xl text-brand-green-accent/50" />
              </div>
              <p className="text-gray-400">No blog posts yet. Check back soon.</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/blog/${post.slug || post.id}`} className="block group rounded-2xl section-card overflow-hidden">
                    <div className="aspect-video bg-brand-blue-light overflow-hidden">
                      {post.image ? (
                        <img
                          src={API_BASE + post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 bg-brand-blue/50">
                          <HiOutlineDocumentText size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-semibold text-white group-hover:text-brand-green-accent transition">{post.title}</h2>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                      <p className="text-brand-green-accent text-xs mt-2 font-medium">{formatDate(post.createdAt)}</p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
