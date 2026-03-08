import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { COMPANY } from '../../config/constants'

export default function CookiePolicy() {
  return (
    <>
      <Helmet>
        <title>Cookie Policy | SM Engineering & Construction</title>
        <meta name="description" content="Cookie Policy for SM Engineering & Construction website." />
      </Helmet>
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <span className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-3">Legal</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white">Cookie Policy</h1>
            <div className="w-16 h-1 bg-brand-green-accent rounded-full mt-4" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl section-card text-gray-400 space-y-6 prose prose-invert max-w-none"
          >
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              <strong className="text-white">{COMPANY.name}</strong> uses cookies and similar technologies to improve your experience on our website.
            </p>
            <h2 className="text-xl font-semibold text-white mt-8">What we use</h2>
            <p>We may use essential cookies for site functionality (e.g. admin login session) and analytics to understand how visitors use our site. We do not use cookies for advertising.</p>
            <h2 className="text-xl font-semibold text-white mt-8">Your choices</h2>
            <p>You can disable or delete cookies via your browser settings. Some features may not work correctly if you disable essential cookies.</p>
            <h2 className="text-xl font-semibold text-white mt-8">Contact</h2>
            <p>For questions: {COMPANY.email}, {COMPANY.phone}.</p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
