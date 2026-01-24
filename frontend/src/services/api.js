import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const client = axios.create({ baseURL: BASE })

export function submitServiceRequest(data) {
  return client.post('/services', data)
}

export function submitProviderApplication(data) {
  return client.post('/providers', data)
}

export function submitFeedback(data) {
  return client.post('/feedback', data)
}

export function adminLogin(credentials) {
  return client.post('/admin/login', credentials)
}

export function fetchAdminDashboard(token) {
  return client.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
}
