import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { COMPANY } from '../config/constants'

const whatsappUrl = `https://wa.me/${COMPANY.whatsapp}`

export default function WhatsAppButton() {
  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 md:right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white shadow-lg shadow-green-900/30 hover:bg-green-500 hover:scale-110 transition-all duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={28} />
    </motion.a>
  )
}
