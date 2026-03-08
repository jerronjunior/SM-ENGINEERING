const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`
  const token = localStorage.getItem('adminToken')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }
  const body = options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined)
  if (options.body instanceof FormData) delete headers['Content-Type']
  const res = await fetch(url, { ...options, headers, body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body: body !== undefined ? body : {} }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
