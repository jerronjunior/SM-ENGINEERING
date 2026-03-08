import { Link } from 'react-router-dom'
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import { COMPANY } from '../config/constants'

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

const legalLinks = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-conditions', label: 'Terms & Conditions' },
  { to: '/cookie-policy', label: 'Cookie Policy' },
]

export default function Footer() {
  return (
    <footer className="relative bg-brand-blue border-t border-brand-green/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue-dark/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20 pointer-events-none" style={{ backgroundSize: '32px 32px' }} />
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="SM Engineering" className="h-12 w-auto" />
              <div>
                <p className="text-xs font-semibold text-gray-400">SM</p>
                <p className="text-sm font-bold text-white">ENGINEERING</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Professional engineering and construction services. House planning, design, cost estimation, and more. Free quotations.
            </p>
            <div className="flex gap-3">
              <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-brand-green/30 text-brand-green-accent hover:bg-brand-green hover:scale-110 transition-all" aria-label="WhatsApp">
                <FaWhatsapp size={20} />
              </a>
              <a href={`mailto:${COMPANY.email}`} className="p-2.5 rounded-xl bg-brand-green/30 text-brand-green-accent hover:bg-brand-green hover:scale-110 transition-all" aria-label="Email">
                <FaEnvelope size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-brand-green-accent text-sm transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-brand-green-accent text-sm transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-0.5 text-brand-green-accent shrink-0" />
                <span>{COMPANY.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="text-brand-green-accent shrink-0" />
                <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`} className="hover:text-brand-green-accent transition">{COMPANY.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-brand-green-accent shrink-0" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-brand-green-accent transition">{COMPANY.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-green/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} SM Engineering & Construction. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Founded {COMPANY.founded} • 1 Year Warranty • Free Quotations
          </p>
        </div>
      </div>
    </footer>
  )
}
