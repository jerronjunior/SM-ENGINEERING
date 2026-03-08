import { motion } from 'framer-motion'

export default function SectionHeading({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      <span className="inline-block text-brand-green-accent text-sm font-semibold uppercase tracking-[0.2em] mb-3">—</span>
      <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight">{title}</h2>
      <div className="w-16 h-1 bg-brand-green-accent rounded-full mx-auto mb-4" />
      {subtitle && <p className="text-gray-400 max-w-2xl mx-auto text-lg">{subtitle}</p>}
    </motion.div>
  )
}
