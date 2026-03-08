import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { api } from '../api/client'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    api.get(`/blog/slug/${slug}`)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  const formatDate = (d) => {
    if (!d) return ''
    const date = d instanceof Date ? d : new Date(d)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
        <Link to="/blog" className="text-brand-green-accent hover:underline">Back to Blog</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | SM Engineering & Construction</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>

      <article className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-brand-green-accent text-sm font-medium hover:underline mb-8">← Back to Blog</Link>
          {post.image && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-video rounded-2xl overflow-hidden section-card mb-10"
            >
              <img src={API_BASE + post.image} alt={post.title} className="w-full h-full object-cover" />
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight"
          >
            {post.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-sm mb-10"
          >
            {formatDate(post.createdAt)}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-lg prose-headings:text-white prose-a:text-brand-green-accent max-w-none text-gray-300 leading-relaxed [&>p]:mb-4"
            dangerouslySetInnerHTML={{ __html: post.content?.replace(/\n/g, '<br />') || '' }}
          />
        </div>
      </article>
    </>
  )
}
