import React, { useState } from 'react'
import { submitProviderApplication } from '../services/api'

export default function ProviderApplication() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', skills: '', experience: '' })
  const [msg, setMsg] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    try {
      await submitProviderApplication(form)
      setMsg('Application submitted')
      setForm({ name: '', email: '', phone: '', skills: '', experience: '' })
    } catch (err) {
      setMsg('Error submitting')
    }
  }

  return (
    <div>
      <h2>Service Provider Application</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
        <input placeholder="Skills" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} />
        <input placeholder="Experience" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} />
        <button type="submit">Apply</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
