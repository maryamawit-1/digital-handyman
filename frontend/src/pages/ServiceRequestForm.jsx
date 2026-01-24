import React, { useState } from 'react'
import { submitServiceRequest } from '../services/api'

export default function ServiceRequestForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', description: '' })
  const [msg, setMsg] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    try {
      await submitServiceRequest(form)
      setMsg('Request submitted')
      setForm({ name: '', email: '', phone: '', address: '', description: '' })
    } catch (err) {
      setMsg('Error submitting')
    }
  }

  return (
    <div>
      <h2>Service Request</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
        <input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <button type="submit">Submit</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
