import express from 'express'
import OpenAI from 'openai'

const router = express.Router()
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const SYSTEM_PROMPT = `You are a helpful assistant for SM Engineering & Construction, a construction company in Sri Lanka.
Company: SM Engineering & Construction
Address: No.89, Badulla, Gamewela Passara, Passara, 90500
Phone: +94 774 222 353
Email: smengconstruction@gmail.com
Services: House Planning & Design, Cost Estimation, Structural Drawings, Approval Drawings, Material Details.
Project types: Residential and Commercial.
They offer FREE quotations and 1 year warranty. Engineer: NDT Moratuwa – Civil Engineering Technology.
Answer briefly and helpfully. If asked about services, pricing, or contact, provide the relevant info and suggest they request a free quotation or contact via phone/WhatsApp/email.`

router.post('/', async (req, res) => {
  const { message, history = [] } = req.body
  if (!message?.trim()) return res.status(400).json({ error: 'Message required' })

  if (!openai) {
    return res.json({
      reply: "Chat is not configured. Please contact us directly: +94 774 222 353 or smengconstruction@gmail.com. We offer free quotations for House Planning, Design, and Cost Estimation.",
    })
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300,
    })
    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    res.json({ reply })
  } catch (err) {
    console.error(err)
    res.json({
      reply: "I'm having trouble right now. Please call us at +94 774 222 353 or email smengconstruction@gmail.com for a free quotation.",
    })
  }
})

export default router
