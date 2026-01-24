import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import ServiceRequestForm from './pages/ServiceRequestForm'
import FeedbackPage from './pages/FeedbackPage'
import ProviderApplication from './pages/ProviderApplication'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/request">Service Request</Link> | <Link to="/apply">Provider Apply</Link> | <Link to="/feedback">Feedback</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request" element={<ServiceRequestForm />} />
        <Route path="/apply" element={<ProviderApplication />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}
