const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  async getConversations() { return request('/api/conversations') },
  async createConversation(title) { return request('/api/conversations', { method: 'POST', body: JSON.stringify({ title }) }) },
  async getMessages(id) { return request(`/api/conversations/${id}/messages`) },
  async postMessage(id, content) { return request(`/api/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }) },
  async getSettings() { return request('/api/settings') },
  async updateSettings(body) { return request('/api/settings', { method: 'PUT', body: JSON.stringify(body) }) },
  async getPrivacy() { return request('/api/privacy') },
}

