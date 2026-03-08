import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  HiOutlineClipboardList,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineLibrary,
  HiOutlineCube,
} from 'react-icons/hi'
import SectionHeading from '../components/SectionHeading'

const mainServices = [
  {
    id: 'planning',
    icon: HiOutlineClipboardList,
    title: 'House Planning & Design',
    description: 'Full house planning and design services tailored to your plot, budget, and preferences. We create functional layouts and elevations that meet local regulations and your vision.',
    benefits: ['Custom designs', 'Plot-based planning', 'Regulation compliance', 'Revisions until you are satisfied'],
  },
  {
    id: 'estimation',
    icon: HiOutlineCurrencyDollar,
    title: 'Cost Estimation',
    description: 'Detailed cost estimates for your project so you can plan your budget with confidence. We break down materials, labour, and other costs for transparency.',
    benefits: ['Itemized estimates', 'Material and labour breakdown', 'No hidden costs', 'Free quotations'],
  },
]

const otherServices = [
  {
    icon: HiOutlineDocumentText,
    title: 'Structural Drawings',
    description: 'Professional structural drawings for construction, ensuring safety and compliance with engineering standards.',
  },
  {
    icon: HiOutlineLibrary,
    title: 'Approval Drawings',
    description: 'Drawings prepared for local authority approval, so your project meets regulatory requirements.',
  },
  {
    icon: HiOutlineCube,
    title: 'Material Details',
    description: 'Detailed material specifications and quantities to support procurement and construction.',
  },
]

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Services | SM Engineering & Construction</title>
        <meta name="description" content="House Planning & Design, Cost Estimation, Structural Drawings, Approval Drawings, Material Details. Free quotations. SM Engineering & Construction." />
      </Helmet>

      <section className="py-24 page-hero relative">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" style={{ backgroundSize: '48px 48px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4"
          >
            What We Offer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            From planning to approval and materials—we support your project at every step.
          </motion.p>
        </div>
      </section>

      <section className="py-24 bg-brand-blue/20">
        <div className="container mx-auto px-4">
          <SectionHeading title="Main Services" subtitle="Core offerings for house owners and companies." />
          <div className="space-y-10">
            {mainServices.map((service, i) => (
              <motion.article
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 md:p-10 rounded-2xl section-card"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-brand-green/20 flex items-center justify-center shrink-0">
                    <service.icon className="text-brand-green-accent text-4xl" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3">{service.title}</h2>
                    <p className="text-gray-400 mb-5 leading-relaxed">{service.description}</p>
                    <h4 className="text-sm font-semibold text-brand-green-accent uppercase tracking-wider mb-2">Benefits</h4>
                    <ul className="grid sm:grid-cols-2 gap-2 text-gray-400">
                      {service.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-green-accent" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="Other Services" subtitle="Structural, approval, and material support." />
          <div className="grid md:grid-cols-3 gap-8">
            {otherServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl section-card"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-green/20 flex items-center justify-center mb-5">
                  <service.icon className="text-brand-green-accent text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-blue/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-8 text-lg">All services come with free quotations. Get in touch to discuss your project.</p>
          <Link to="/contact" className="btn-primary">
            Request Free Quotation
          </Link>
        </div>
      </section>
    </>
  )
}
