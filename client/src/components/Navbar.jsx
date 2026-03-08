import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenuAlt3, HiX } from 'react-icons/hi'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-brand-blue/90 backdrop-blur-md border-b border-brand-green/20 shadow-lg shadow-black/20"
    >
      <nav className="container mx-auto px-4 flex items-center justify-between h-16 md:h-18">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/logo.svg" alt="SM Engineering" className="h-12 w-auto" />
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-400">SM</p>
            <p className="text-sm font-bold text-white">ENGINEERING</p>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-6">
          {links.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`text-sm font-medium transition-colors relative ${location.pathname === to ? 'text-brand-green-accent' : 'text-gray-300 hover:text-white'}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-blue-light border-t border-brand-green/20"
          >
            <ul className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className={`block py-2 font-medium ${location.pathname === to ? 'text-brand-green-accent' : 'text-gray-300'}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
