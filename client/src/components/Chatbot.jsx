import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChatAlt2, HiX } from 'react-icons/hi'
import { api } from '../api/client'

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm here to help with SM Engineering & Construction. Ask about our services, free quotations, or contact details." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const { reply } = await api.post('/chat', { message: text, history })
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't respond. Please call +94 774 222 353 or email smengconstruction@gmail.com for assistance." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-4 md:right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-brand-green text-white shadow-lg hover:bg-brand-green-light transition-colors"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        {open ? <HiX size={24} /> : <HiChatAlt2 size={24} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-md h-[480px] bg-brand-blue-light border border-brand-green/30 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          >
            <div className="p-3 border-b border-brand-green/20 bg-brand-blue flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center">
                <HiChatAlt2 className="text-white" size={18} />
              </div>
              <span className="font-semibold text-white">SM Engineering Assistant</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-brand-green text-white'
                        : 'bg-brand-blue border border-brand-green/20 text-gray-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-3 py-2 bg-brand-blue border border-brand-green/20 text-gray-400 text-sm">
                    Typing...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <form
              className="p-3 border-t border-brand-green/20 flex gap-2"
              onSubmit={(e) => { e.preventDefault(); send(); }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about services or contact..."
                className="flex-1 bg-brand-blue border border-brand-green/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green-light disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
