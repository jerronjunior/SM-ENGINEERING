import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiOutlinePhotograph } from 'react-icons/hi'
import SectionHeading from '../components/SectionHeading'

export default function Projects() {
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

  const upcomingGalleryImages = [
    '/projects/Upcomming 03.png',
    '/projects/Upcomming 04.png',
  ]

  const upcomingProjectFiles = [
    '/projects/Upcomming 01.pdf',
    '/projects/Upcomming 02.pdf',
  ]

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

  // Create project items from gallery images
  const generateProjects = () => {
    const completed = completedGalleryImages.map((img, idx) => ({
      id: `completed-room-gallery-${idx + 1}`,
      title: `Completed Room Interior Gallery - View ${idx + 1}`,
      description: `Completed room interior image ${idx + 1} of ${completedGalleryImages.length}.`,
      type: 'residential',
      status: 'completed',
      images: [img],
    }))

    const ongoing = ongoingGalleryImages.map((img, idx) => ({
      id: `ongoing-project-gallery-${idx + 1}`,
      title: `Ongoing Project Gallery - View ${idx + 1}`,
      description: `Ongoing construction progress image ${idx + 1} of ${ongoingGalleryImages.length}.`,
      type: 'commercial',
      status: 'ongoing',
      images: [img],
    }))

    const upcoming = upcomingGalleryImages.map((img, idx) => ({
      id: `upcoming-project-gallery-${idx + 1}`,
      title: `Upcoming Project Gallery - View ${idx + 1}`,
      description: `Upcoming project file ${idx + 1} of ${upcomingGalleryImages.length}.`,
      type: 'commercial',
      status: 'upcoming',
      images: [img],
      previewFiles: [upcomingProjectFiles[idx]],
    }))

    return { completed, ongoing, upcoming }
  }

  const { completed, ongoing, upcoming } = generateProjects()

  const sections = [
    { key: 'completed', items: completed },
    { key: 'ongoing', items: ongoing },
    { key: 'upcoming', items: upcoming },
  ]

  const filteredSections = filter === 'all'
    ? sections
    : sections.filter(section => section.key === filter)

  const hasProjectsToShow = completed.length > 0 || ongoing.length > 0 || upcoming.length > 0

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
          {/* Filter Menu Bar */}
          {hasProjectsToShow && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 flex flex-wrap gap-3 justify-center"
            >
              {[
                { value: 'all', label: 'All' },
                { value: 'completed', label: 'Completed' },
                { value: 'ongoing', label: 'Ongoing' },
                { value: 'upcoming', label: 'Upcoming' },
              ].map((btn) => (
                <motion.button
                  key={btn.value}
                  type="button"
                  onClick={() => setFilter(btn.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all capitalize ${
                    filter === btn.value
                      ? 'bg-brand-green text-white shadow-lg shadow-brand-green/50'
                      : 'bg-brand-blue/30 text-gray-300 hover:bg-brand-blue/50 hover:text-white'
                  }`}
                >
                  {btn.label}
                </motion.button>
              ))}
            </motion.div>
          )}

          {!hasProjectsToShow ? (
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
              {filteredSections.map(({ key, items }) => {
                const meta = categoryMeta[key]

                if (items.length === 0) return null

                return (
                  <div key={key}>
                    <SectionHeading title={meta.title} />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((project, i) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`group rounded-2xl overflow-hidden section-card border-l-4 ${meta.borderClass}`}
                        >
                          <div className="aspect-video bg-brand-blue-light relative overflow-hidden">
                            {project.images[0] ? (
                              <button
                                type="button"
                                onClick={() => openPreview(project.previewFiles || project.images, 0)}
                                className="w-full h-full"
                                aria-label={`Preview ${project.title}`}
                              >
                                {isPdf(project.images[0]) ? (
                                  <div className="w-full h-full flex items-center justify-center bg-brand-blue/60 text-center px-4">
                                    <div>
                                      <p className="text-white font-semibold">PDF Preview</p>
                                      <p className="text-gray-300 text-sm mt-1">Click to open drawing</p>
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={project.images[0]}
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
