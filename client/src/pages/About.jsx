import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiOutlineAcademicCap, HiOutlineLightBulb, HiOutlineEye } from 'react-icons/hi'
import { COMPANY } from '../config/constants'
import SectionHeading from '../components/SectionHeading'

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | SM Engineering & Construction</title>
        <meta name="description" content="About SM Engineering & Construction - Mission, vision, engineer qualifications, and company background. NDT Moratuwa – Civil Engineering Technology." />
      </Helmet>

      <section className="py-24 page-hero relative">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" style={{ backgroundSize: '48px 48px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            About Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            Professional engineering and construction for house owners and companies.
          </motion.p>
        </div>
      </section>

      <section className="py-24 bg-brand-blue/20">
        <div className="container mx-auto px-4">
          <SectionHeading title="Company Introduction" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto p-8 md:p-10 rounded-2xl section-card"
          >
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              <strong className="text-white">{COMPANY.name}</strong> is an engineering and construction company based in Passara, Sri Lanka. We were founded on {COMPANY.founded} and specialize in house planning, design, cost estimation, structural drawings, approval drawings, and material details.
            </p>
            <p className="text-gray-400 leading-relaxed">
              We serve <strong className="text-white">house owners</strong> and <strong className="text-white">companies</strong> with residential and commercial projects. Every project comes with our <strong className="text-brand-green-accent">{COMPANY.warranty}</strong>, and we offer <strong className="text-brand-green-accent">free quotations</strong> for all clients.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="Mission & Vision" />
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl section-card border-l-4 border-l-brand-green-accent"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-green/20 flex items-center justify-center mb-5">
                <HiOutlineLightBulb className="text-brand-green-accent text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To deliver quality engineering and construction services with clear communication, accurate cost estimation, and reliable execution for every client.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl section-card border-l-4 border-l-brand-green-accent"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-green/20 flex items-center justify-center mb-5">
                <HiOutlineEye className="text-brand-green-accent text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                To be a trusted name in engineering and construction across Sri Lanka, known for professionalism, transparency, and lasting results.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-blue/20">
        <div className="container mx-auto px-4">
          <SectionHeading title="Engineer Qualification" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto flex items-start gap-6 p-8 rounded-2xl section-card"
          >
            <div className="w-16 h-16 rounded-xl bg-brand-green/20 flex items-center justify-center shrink-0">
              <HiOutlineAcademicCap className="text-brand-green-accent text-3xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Civil Engineering Technology</h3>
              <p className="text-gray-400 text-lg">{COMPANY.qualification}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="Company Background" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto p-8 rounded-2xl section-card text-gray-400 space-y-4"
          >
            <p className="leading-relaxed">
              SM Engineering & Construction is located at {COMPANY.address}. We combine technical expertise with practical experience to deliver planning, design, and estimation services that meet local requirements and client expectations.
            </p>
            <p className="leading-relaxed">
              Our services include house planning and design, cost estimation, structural drawings, approval drawings, and material details—all backed by a 1-year warranty and free quotations so you can make informed decisions.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
