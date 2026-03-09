import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsConditions from './pages/legal/TermsConditions'
import CookiePolicy from './pages/legal/CookiePolicy'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import WhatsAppButton from './components/WhatsAppButton'
import Chatbot from './components/Chatbot'

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="projects" element={<Projects />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-conditions" element={<TermsConditions />} />
          <Route path="cookie-policy" element={<CookiePolicy />} />
        </Route>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <WhatsAppButton />
      <Chatbot />
    </>
  )
}

export default App
