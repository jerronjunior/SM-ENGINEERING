import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiOutlinePhotograph } from 'react-icons/hi'
import { api } from '../api/client'
import SectionHeading from '../components/SectionHeading'
import { FALLBACK_PROJECTS } from '../config/constants'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [preview, setPreview] = useState({ open: false, images: [], index: 0 })

  const completedGalleryImages = [
    '/projects/Completed 1.jpeg',
    '/projects/Completed 2.jpeg',
    '/projects/Completed 3.jpeg',
    '/projects/Completed 4.jpeg',
  ]

  const ongoingGalleryImages = [
    '/projects/Ongoing 01.jpeg',
    '/projects/Ongoing 02.jpeg',
    '/projects/Ongoing 03.jpeg',
    '/projects/Ongoing 04.jpeg',
    '/projects/Ongoing 05.jpeg',
    '/projects/Ongoing 06.jpeg',
    '/projects/Ongoing 07.jpeg',
    '/projects/Ongoing 08.jpeg',
    '/projects/Ongoing 09.jpeg',
    '/projects/Ongoing 10.jpeg',
    '/projects/Ongoing 11.jpeg',
    '/projects/Ongoing 12.jpeg',
    '/projects/Ongoing 13.jpeg',
  ]

  const upcomingGalleryFiles = [
    '/projects/Upcomming 01.pdf',
    '/projects/Upcomming 02.pdf',
  ]

  useEffect(() => {
    api.get('/projects')
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const safeProjects = projects.length > 0 ? projects : FALLBACK_PROJECTS

  const normalizeStatus = (project) => {
    if (project.status === 'completed' || project.status === 'ongoing' || project.status === 'upcoming') {
      return project.status
    }
    return 'completed'
  }

  const filtered = filter === 'all'
    ? safeProjects
    : safeProjects.filter((p) => normalizeStatus(p) === filter)

  const completed = filtered.filter((p) => normalizeStatus(p) === 'completed')
  const ongoing = filtered.filter((p) => normalizeStatus(p) === 'ongoing')
  const upcoming = filtered.filter((p) => normalizeStatus(p) === 'upcoming')

  const imageSrc = (project) => {
    const firstImage = project.images?.[0]
    if (!firstImage) return null
    if (firstImage.startsWith('http') || firstImage.startsWith('/projects/')) return firstImage
    return API_BASE + firstImage
  }

  const imageList = (project) => {
    if (!Array.isArray(project.images)) return []
    return project.images
      .filter(Boolean)
      .map((img) => (img.startsWith('http') || img.startsWith('/projects/') ? img : API_BASE + img))
  }

  const isPdf = (src) => typeof src === 'string' && src.toLowerCase().endsWith('.pdf')

  const categoryMeta = {
    completed: {
      title: 'Completed Projects',
      borderClass: 'border-l-emerald-500',
      badgeClass: 'bg-emerald-600/90',
      badgeLabel: 'Completed',
    },
    ongoing: {
      title: 'Ongoing Projects',
      borderClass: 'border-l-sky-500',
      badgeClass: 'bg-sky-600/90',
      badgeLabel: 'Ongoing',
    },
    upcoming: {
      title: 'Upcoming Projects',
      borderClass: 'border-l-amber-500',
      badgeClass: 'bg-amber-600/90',
      badgeLabel: 'Upcoming',
    },
  }

  const sections = [
    { key: 'completed', items: completed },
    { key: 'ongoing', items: ongoing },
    { key: 'upcoming', items: upcoming },
  ]

  const hasProjectsToShow = filtered.length > 0 || filter === 'all' || filter === 'completed' || filter === 'ongoing' || filter === 'upcoming'

  const openPreview = (images, index = 0) => {
    if (!images?.length) return
    setPreview({ open: true, images, index })
  }

  const closePreview = () => {
    setPreview({ open: false, images: [], index: 0 })
  }

  const prevPreview = () => {
    setPreview((current) => {
      const count = current.images.length
      if (!count) return current
      return { ...current, index: (current.index - 1 + count) % count }
    })
  }

  const nextPreview = () => {
    setPreview((current) => {
      const count = current.images.length
      if (!count) return current
      return { ...current, index: (current.index + 1) % count }
    })
  }

  useEffect(() => {
    if (!preview.open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closePreview()
        return
      }
      if (event.key === 'ArrowLeft') {
        prevPreview()
        return
      }
      if (event.key === 'ArrowRight') {
        nextPreview()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [preview.open])

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
            {['all', 'completed', 'ongoing', 'upcoming'].map((f) => (
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
          ) : !hasProjectsToShow ? (
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
            <div className="space-y-14">
              {sections.map(({ key, items }) => {
                const meta = categoryMeta[key]
                const sectionItems = key === 'completed'
                  ? completedGalleryImages.map((img, idx) => ({
                    id: `completed-room-gallery-${idx + 1}`,
                    title: `Completed Room Interior Gallery - View ${idx + 1}`,
                    description: `Completed room interior image ${idx + 1} of ${completedGalleryImages.length}.`,
                    type: 'residential',
                    status: 'completed',
                    images: [img],
                  }))
                  : key === 'ongoing'
                    ? ongoingGalleryImages.map((img, idx) => ({
                      id: `ongoing-project-gallery-${idx + 1}`,
                      title: `Ongoing Project Gallery - View ${idx + 1}`,
                      description: `Ongoing construction progress image ${idx + 1} of ${ongoingGalleryImages.length}.`,
                      type: 'commercial',
                      status: 'ongoing',
                      images: [img],
                    }))
                    : key === 'upcoming'
                      ? upcomingGalleryFiles.map((file, idx) => ({
                        id: `upcoming-project-gallery-${idx + 1}`,
                        title: `Upcoming Project Gallery - View ${idx + 1}`,
                        description: `Upcoming project drawing ${idx + 1} of ${upcomingGalleryFiles.length}.`,
                        type: 'commercial',
                        status: 'upcoming',
                        images: [file],
                      }))
                  : items

                if (sectionItems.length === 0) return null

                return (
                  <div key={key}>
                    <SectionHeading title={meta.title} />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sectionItems.map((project, i) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`group rounded-2xl overflow-hidden section-card border-l-4 ${meta.borderClass}`}
                        >
                          <div className="aspect-video bg-brand-blue-light relative overflow-hidden">
                            {imageList(project).length > 1 ? (
                              <div className="grid grid-cols-2 h-full gap-1 p-1">
                                {imageList(project).slice(0, 4).map((img, idx) => (
                                  <button
                                    key={`${project.id}-${idx}`}
                                    type="button"
                                    onClick={() => openPreview(imageList(project), idx)}
                                    className="w-full h-full"
                                    aria-label={`Preview ${project.title} image ${idx + 1}`}
                                  >
                                    <img
                                      src={img}
                                      alt={`${project.title} ${idx + 1}`}
                                      className="w-full h-full object-cover rounded-md group-hover:scale-[1.02] transition duration-500"
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : imageSrc(project) ? (
                              <button
                                type="button"
                                onClick={() => openPreview(imageList(project), 0)}
                                className="w-full h-full"
                                aria-label={`Preview ${project.title}`}
                              >
                                {isPdf(imageSrc(project)) ? (
                                  <div className="w-full h-full flex items-center justify-center bg-brand-blue/60 text-center px-4">
                                    <div>
                                      <p className="text-white font-semibold">PDF Preview</p>
                                      <p className="text-gray-300 text-sm mt-1">Click to open drawing</p>
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={imageSrc(project)}
                                    alt={project.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                  />
                                )}
                              </button>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 bg-brand-blue/50">
                                <HiOutlinePhotograph size={48} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-transparent to-transparent opacity-60 pointer-events-none" />
                            {project.beforeAfter && (
                              <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-brand-green/90 text-white text-xs font-medium pointer-events-none">Before/After</span>
                            )}
                            <span className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-white text-xs font-medium pointer-events-none ${meta.badgeClass}`}>
                              {meta.badgeLabel}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                            <p className="text-brand-green-accent text-xs mt-2 capitalize font-medium">{project.type || 'Project'}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {preview.open && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={closePreview}
        >
          <button
            type="button"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg"
            onClick={closePreview}
          >
            Close
          </button>

          {preview.images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 md:left-8 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg"
                onClick={(e) => {
                  e.stopPropagation()
                  prevPreview()
                }}
              >
                Prev
              </button>
              <button
                type="button"
                className="absolute right-3 md:right-8 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg"
                onClick={(e) => {
                  e.stopPropagation()
                  nextPreview()
                }}
              >
                Next
              </button>
            </>
          )}

          {isPdf(preview.images[preview.index]) ? (
            <iframe
              src={preview.images[preview.index]}
              title={`Preview ${preview.index + 1}`}
              className="h-[88vh] w-[92vw] rounded-xl shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={preview.images[preview.index]}
              alt={`Preview ${preview.index + 1}`}
              className="max-h-[88vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  )
}
