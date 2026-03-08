import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiOutlinePhotograph } from 'react-icons/hi'
import { api } from '../api/client'
import SectionHeading from '../components/SectionHeading'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/projects')
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? projects
    : projects.filter((p) => (p.type || p.status) === filter || p.status === filter)

  const upcoming = projects.filter((p) => p.status === 'upcoming')
  const completed = projects.filter((p) => p.status === 'completed' || !p.status)

  return (
    <>
      <Helmet>
        <title>Projects | SM Engineering & Construction</title>
        <meta name="description" content="View our residential and commercial projects. Before/after and project gallery. SM Engineering & Construction." />
      </Helmet>

      <section className="py-24 page-hero relative">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" style={{ backgroundSize: '48px 48px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4"
          >
            Our Work
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            Residential and commercial projects we have delivered and upcoming work.
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-10">
            {['all', 'completed', 'upcoming', 'residential', 'commercial'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${filter === f ? 'bg-brand-green text-white shadow-glow' : 'bg-brand-blue/80 border border-brand-green/30 text-gray-400 hover:text-white hover:border-brand-green/50'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-brand-blue animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 rounded-2xl section-card"
            >
              <div className="w-20 h-20 rounded-2xl bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlinePhotograph className="text-5xl text-brand-green-accent/50" />
              </div>
              <p className="text-gray-400">No projects to show yet. Check back soon.</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl overflow-hidden section-card"
                >
                  <div className="aspect-video bg-brand-blue-light relative overflow-hidden">
                    {project.images?.length > 0 ? (
                      <img
                        src={API_BASE + project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-brand-blue/50">
                        <HiOutlinePhotograph size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-transparent to-transparent opacity-60" />
                    {project.beforeAfter && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-brand-green/90 text-white text-xs font-medium">Before/After</span>
                    )}
                    {project.status === 'upcoming' && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-amber-600/90 text-white text-xs font-medium">Upcoming</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                    <p className="text-brand-green-accent text-xs mt-2 capitalize font-medium">{project.type || project.status || 'Project'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="py-16 bg-brand-blue/50">
          <div className="container mx-auto px-4">
            <SectionHeading title="Upcoming Projects" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl section-card border-l-4 border-l-amber-500"
                >
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{p.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
