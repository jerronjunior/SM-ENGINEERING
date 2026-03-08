import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { COMPANY } from '../../config/constants'

export default function TermsConditions() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | SM Engineering & Construction</title>
        <meta name="description" content="Terms and Conditions for using SM Engineering & Construction website and services." />
      </Helmet>
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <span className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-3">Legal</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white">Terms & Conditions</h1>
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
              By using the website and services of <strong className="text-white">{COMPANY.name}</strong>, you agree to these terms.
            </p>
            <h2 className="text-xl font-semibold text-white mt-8">Services</h2>
            <p>We provide engineering and construction services including house planning, design, cost estimation, structural drawings, approval drawings, and material details. Quotations are free and non-binding unless otherwise agreed in writing.</p>
            <h2 className="text-xl font-semibold text-white mt-8">Warranty</h2>
            <p>Projects are covered by our 1-year warranty as stated in our project agreements. Specific terms will be provided with your contract.</p>
            <h2 className="text-xl font-semibold text-white mt-8">Website use</h2>
            <p>You may not use this website for any unlawful purpose or to attempt to gain unauthorized access to our systems or data.</p>
            <h2 className="text-xl font-semibold text-white mt-8">Contact</h2>
            <p>Questions about these terms: {COMPANY.email}, {COMPANY.phone}, {COMPANY.address}.</p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
