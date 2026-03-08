import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import { COMPANY } from '../config/constants'
import { api } from '../api/client'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    setLoading(true)
    try {
      await api.post('/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <>
      <Helmet>
        <title>Contact | SM Engineering & Construction</title>
        <meta name="description" content="Contact SM Engineering & Construction for free quotations. Phone, email, WhatsApp. Passara, Sri Lanka." />
      </Helmet>

      <section className="py-24 page-hero relative">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" style={{ backgroundSize: '48px 48px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            Get a free quotation. We will get back to you as soon as possible.
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="p-6 rounded-2xl section-card">
                <h2 className="text-xl font-semibold text-white mb-5">Get in touch</h2>
                <ul className="space-y-4 text-gray-400">
                  <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-blue/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-brand-green/20 flex items-center justify-center shrink-0">
                      <FaMapMarkerAlt className="text-brand-green-accent" />
                    </div>
                    <span>{COMPANY.address}</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-blue/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-brand-green/20 flex items-center justify-center shrink-0">
                      <FaPhone className="text-brand-green-accent" />
                    </div>
                    <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`} className="hover:text-brand-green-accent transition">{COMPANY.phone}</a>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-blue/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-brand-green/20 flex items-center justify-center shrink-0">
                      <FaEnvelope className="text-brand-green-accent" />
                    </div>
                    <a href={`mailto:${COMPANY.email}`} className="hover:text-brand-green-accent transition">{COMPANY.email}</a>
                  </li>
                  <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-blue/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-brand-green/20 flex items-center justify-center shrink-0">
                      <FaWhatsapp className="text-brand-green-accent" />
                    </div>
                    <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-green-accent transition">WhatsApp: {COMPANY.phone}</a>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl overflow-hidden section-card aspect-[4/3] flex items-center justify-center text-gray-500">
                <p className="text-sm">Google Map placeholder – company can add embed later</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <form onSubmit={handleSubmit} className="p-8 rounded-2xl section-card space-y-5">
                <h2 className="text-xl font-semibold text-white mb-4">Send a message</h2>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-brand-blue-dark border border-brand-green/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-brand-blue-dark border border-brand-green/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-brand-blue-dark border border-brand-green/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Free quotation for house design"
                    className="w-full px-4 py-3 rounded-xl bg-brand-blue-dark border border-brand-green/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-brand-blue-dark border border-brand-green/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green resize-none transition"
                  />
                </div>
                {status === 'success' && <p className="text-green-500 text-sm">Message sent. We will get back to you soon.</p>}
                {status === 'error' && <p className="text-red-500 text-sm">Something went wrong. Please try again or contact us by phone/email.</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl btn-primary disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
