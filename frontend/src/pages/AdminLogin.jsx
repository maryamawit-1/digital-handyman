import React, { useState } from 'react'
import { adminLogin } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const res = await adminLogin(creds)
      localStorage.setItem('token', res.data.token)
      nav('/admin/dashboard')
    } catch (err) {
      setMsg('Login failed')
    }
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Username" value={creds.username} onChange={e=>setCreds({...creds,username:e.target.value})} />
        <input type="password" placeholder="Password" value={creds.password} onChange={e=>setCreds({...creds,password:e.target.value})} />
        <button type="submit">Login</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
