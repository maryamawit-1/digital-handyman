import axios from 'axios'

const BASE = 'http://localhost:3000'; // Both point to the same API
const client = axios.create({ baseURL: BASE });

/** Helper for Admin/Provider Headers */
function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

// ==========================================
// 1. PUBLIC ROUTES (Customers / General)
// ==========================================

export function getServices() {
  return client.get('/api/services')
}

export function submitServiceRequest(data) {
  return client.post('/api/requests', data)
}

export function trackRequestPublic(refId) {
  return client.get(`/api/requests/track/${refId}`)
}

export function submitProviderApplication(data) {
  return client.post('/api/providers/apply', data)
}

export function submitFeedback(data) {
  return client.post('/api/feedback', data)
}

// ==========================================
// 2. AUTHENTICATION (Login)
// ==========================================

export function authLogin(credentials) {
  return client.post('/api/auth/login', credentials)
}

export function providerLogin(credentials) {
  return client.post('/api/providers/login', credentials)
}

// ==========================================
// 3. ADMIN ROUTES (Management)
// ==========================================

export function fetchAdminDashboard(token) {
  return client.get('/api/admin/dashboard', authHeaders(token))
}

export function adminGetServiceRequests(token) {
  return client.get('/api/admin/requests', authHeaders(token))
}

export function adminUpdateServiceRequest(token, id, data) {
  return client.patch(`/api/admin/requests/${id}`, data, authHeaders(token))
}

export function adminDeleteRequest(token, id) {
  return client.delete(`/api/admin/requests/${id}`, authHeaders(token))
}

export function adminGetApplications(token) {
  return client.get('/api/admin/applications', authHeaders(token))
}

export function adminApproveApplication(token, id) {
  return client.post(`/api/admin/applications/${id}/approve`, {}, authHeaders(token))
}

export function adminCreateService(token, data) {
  return client.post('/api/admin/services', data, authHeaders(token))
}

export function adminUpdateService(token, id, data) {
  return client.put(`/api/admin/services/${id}`, data, authHeaders(token))
}

export function adminDeleteService(token, id) {
  return client.delete(`/api/admin/services/${id}`, authHeaders(token))
}

export function adminGetReports(token) {
  return client.get('/api/admin/reports', authHeaders(token))
}

export function adminGetAllFeedback(token) {
  return client.get('/api/admin/feedback', authHeaders(token))
}

export function adminDeleteFeedback(token, id) {
  return client.delete(`/api/admin/feedback/${id}`, authHeaders(token))
}

// ... existing code above ...

// Update this function name specifically:
export function adminGetAvailableProviders(token) {
  return client.get('/api/admin/providers/available', authHeaders(token))
}

// Keep this one as well:
export function adminAssignProvider(token, requestId, providerId) {
  return client.post('/api/admin/requests/assign', { requestId, providerId }, authHeaders(token))
}

// ... rest of the file ...

export function adminDeleteProvider(token, id) {
  return client.delete(`/api/admin/providers/${id}`, authHeaders(token))
}

// ==========================================
// 4. PROVIDER ROUTES (Portal)
// ==========================================

export function getProviderJobs(token, providerId) {
  return client.get(`/api/providers/${providerId}/jobs`, authHeaders(token))
}

/** This was the duplicated function causing the crash */
export function providerCompleteJob(token, providerId, jobId) {
  return client.patch(`/api/providers/${providerId}/jobs/${jobId}/complete`, {}, authHeaders(token))
}

// In frontend/src/services/api.js
export function adminCreateProvider(token, data) {
  return client.post('/api/admin/providers', data, authHeaders(token));
}

export default client;