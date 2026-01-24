import React, { useEffect, useState } from 'react'
import { fetchAdminDashboard } from '../services/api'

export default function AdminDashboard() {
  const [data, setData] = useState({ services: [], providers: [], feedbacks: [] })
  const [err, setErr] = useState('')

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if (!token) return setErr('Not authenticated')
    fetchAdminDashboard(token).then(res=>setData(res.data)).catch(()=>setErr('Failed to load'))
  }, [])

  if (err) return <div><h2>Admin Dashboard</h2><p>{err}</p></div>

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Service Requests</h3>
        <pre>{JSON.stringify(data.services, null, 2)}</pre>
      </section>
      <section>
        <h3>Provider Applications</h3>
        <pre>{JSON.stringify(data.providers, null, 2)}</pre>
      </section>
      <section>
        <h3>Feedbacks</h3>
        <pre>{JSON.stringify(data.feedbacks, null, 2)}</pre>
      </section>
    </div>
  )
}
