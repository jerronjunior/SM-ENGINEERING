import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineOfficeBuilding, HiOutlineShieldCheck } from 'react-icons/hi'
import { COMPANY } from '../config/constants'
import SectionHeading from '../components/SectionHeading'
import AnimatedCounter from '../components/AnimatedCounter'

const services = [
  { icon: HiOutlineClipboardList, title: 'House Planning & Design', to: '/services#planning' },
  { icon: HiOutlineCurrencyDollar, title: 'Cost Estimation', to: '/services#estimation' },
  { icon: HiOutlineOfficeBuilding, title: 'Structural & Approval Drawings', to: '/services' },
]

const whyUs = [
  { icon: HiOutlineShieldCheck, title: '1 Year Warranty', desc: 'All projects come with our warranty for your peace of mind.' },
  { title: 'Free Quotations', desc: 'Request a free quote with no obligation.' },
  { title: 'Qualified Engineer', desc: COMPANY.qualification },
  { title: 'Residential & Commercial', desc: COMPANY.projectTypes.join(' and ') + ' projects.' },
]

export default function Home() {
  return (
    <>
      <Helmet>
        <title>SM Engineering & Construction | House Planning, Design & Cost Estimation</title>
        <meta name="description" content="SM Engineering & Construction - House Planning, Design, Cost Estimation. Residential & Commercial. Free quotations. 1 Year warranty. Passara, Sri Lanka." />
      </Helmet>

      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden page-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-green/15 via-transparent to-brand-blue-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.15),transparent)]" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" style={{ backgroundSize: '64px 64px' }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <img src="/logo.png" alt="SM Engineering Logo" className="h-32 w-auto drop-shadow-[0_0_30px_rgba(34,197,94,0.2)]" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.25em] mb-6"
          >
            Engineering & Construction
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight"
          >
            SM <span className="text-brand-green-accent drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">ENGINEERING</span>
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl text-gray-300 font-semibold">& CONSTRUCTION</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            House Planning • Design • Cost Estimation • Structural Drawings
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/contact" className="btn-primary">
              Get Free Quotation
            </Link>
            <Link to="/services" className="btn-secondary">
              Our Services
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/30 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeading title="Who We Are" subtitle="Professional engineering and construction services for house owners and companies." />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="p-8 md:p-10 rounded-2xl bg-brand-blue/60 border border-brand-green/20 backdrop-blur-sm shadow-card">
              <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                <strong className="text-white">SM Engineering & Construction</strong> offers house planning, design, cost estimation, structural drawings, approval drawings, and material details. We serve residential and commercial clients with free quotations and a 1-year warranty on projects.
              </p>
              <p className="text-gray-400">Based in Passara, Sri Lanka. Founded {COMPANY.founded}.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-brand-blue/30">
        <div className="container mx-auto px-4">
          <SectionHeading title="Our Services" subtitle="From planning to execution, we support your project at every step." />
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={item.to} className="block p-8 rounded-2xl section-card group">
                  <div className="w-14 h-14 rounded-xl bg-brand-green/20 flex items-center justify-center mb-5 group-hover:bg-brand-green/30 group-hover:scale-110 transition-all duration-300">
                    <item.icon className="text-brand-green-accent text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <span className="text-brand-green-accent text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">Learn more →</span>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="text-brand-green-accent font-medium hover:underline underline-offset-4">View all services</Link>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="Why Choose Us" subtitle="Quality, transparency, and support you can trust." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl section-card group"
              >
                {item.icon && (
                  <div className="w-12 h-12 rounded-lg bg-brand-green/20 flex items-center justify-center mb-4 group-hover:bg-brand-green/30 transition-colors">
                    <item.icon className="text-brand-green-accent text-xl" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-blue/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: <><AnimatedCounter end={100} suffix="+" /></>, label: 'Projects Delivered' },
              { value: <><AnimatedCounter end={1} suffix=" Year" /></>, label: 'Warranty' },
              { value: 'Free', label: 'Quotations' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl section-card text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-brand-green-accent mb-2">{stat.value}</p>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green/15 via-brand-green/5 to-brand-green/15" />
        <div className="absolute inset-0 border-y border-brand-green/20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to Start Your Project?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-400 mb-10 max-w-xl mx-auto text-lg"
          >
            Get a free quotation today. No obligation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/contact" className="btn-primary">
              Contact Us
            </Link>
            <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
