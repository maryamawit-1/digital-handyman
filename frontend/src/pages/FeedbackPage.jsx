import React, { useState } from 'react'
import { submitFeedback } from '../services/api'

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: '' })
  const [msg, setMsg] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    try {
      await submitFeedback(form)
      setMsg('Feedback submitted')
      setForm({ name: '', email: '', message: '', rating: '' })
    } catch (err) {
      setMsg('Error submitting')
    }
  }

  return (
    <div>
      <h2>Feedback</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <textarea placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
        <input placeholder="Rating" value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})} />
        <button type="submit">Send</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
