import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { COMPANY } from '../../config/constants'

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | SM Engineering & Construction</title>
        <meta name="description" content="Privacy Policy for SM Engineering & Construction website." />
      </Helmet>
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <span className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-3">Legal</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white">Privacy Policy</h1>
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
              <strong className="text-white">{COMPANY.name}</strong> (“we”, “us”) respects your privacy. This policy describes how we collect, use, and protect your information when you use our website or contact us.
            </p>
            <h2 className="text-xl font-semibold text-white mt-8">Information we collect</h2>
            <p>When you use our contact form or get in touch, we may collect your name, email, phone number, and message content. We use this only to respond to your enquiries and provide our services.</p>
            <h2 className="text-xl font-semibold text-white mt-8">How we use your information</h2>
            <p>We use your information to respond to enquiries, send quotations, and communicate about projects. We do not sell or share your data with third parties for marketing.</p>
            <h2 className="text-xl font-semibold text-white mt-8">Data storage and security</h2>
            <p>Your data is stored securely. We retain contact form submissions for as long as needed to fulfil your request and our business records.</p>
            <h2 className="text-xl font-semibold text-white mt-8">Your rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data by contacting us at {COMPANY.email} or {COMPANY.phone}.</p>
            <h2 className="text-xl font-semibold text-white mt-8">Contact</h2>
            <p>For privacy-related questions: {COMPANY.email}, {COMPANY.address}.</p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
