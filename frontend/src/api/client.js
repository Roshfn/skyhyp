const BASE_URL = '/api/v1'

const STORAGE_KEYS = {
  accessToken: 'skyhyp.accessToken',
  refreshToken: 'skyhyp.refreshToken'
}

export function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.accessToken)
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.refreshToken)
}

export function setTokens({ accessToken, refreshToken }) {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
}

/**
 * Decodes the JWT payload client-side, purely for display (e.g. showing the
 * user's email in the header). This is NOT a security check - the server
 * still verifies the signature on every request.
 */
export function decodeAccessToken(token) {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || 'Request failed')
    this.status = status
    this.fieldErrors = body?.fieldErrors || null
  }
}

let refreshPromise = null

async function refreshAccessToken() {
  // Coalesce concurrent 401s into a single refresh call.
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new ApiError(401, { message: 'No refresh token' })

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if (!res.ok) {
      clearTokens()
      throw new ApiError(res.status, await safeJson(res))
    }

    const data = await res.json()
    setTokens(data)
    return data.accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Core request helper. `auth: true` (default) attaches the access token and
 * transparently retries once after a refresh if the server returns 401.
 */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  if (res.status === 401 && auth) {
    try {
      const newToken = await refreshAccessToken()
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
        body: body !== undefined ? JSON.stringify(body) : undefined
      })
      if (!retryRes.ok) throw new ApiError(retryRes.status, await safeJson(retryRes))
      return retryRes.status === 204 ? null : retryRes.json()
    } catch (err) {
      clearTokens()
      window.location.href = '/login'
      throw err
    }
  }

  if (!res.ok) throw new ApiError(res.status, await safeJson(res))
  return res.status === 204 ? null : res.json()
}

export const api = {
  // --- auth (all public, no token needed) ---
  registerInitiate: (gmail) =>
    request('/auth/register/initiate', { method: 'POST', body: { gmail }, auth: false }),

  registerVerifyEmail: (gmail, otp) =>
    request('/auth/register/verify-email', { method: 'POST', body: { gmail, otp }, auth: false }),

  registerComplete: (payload) =>
    request('/auth/register/complete', { method: 'POST', body: payload, auth: false }),

  login: (gmail, password) =>
    request('/auth/login', { method: 'POST', body: { gmail, password }, auth: false }),

  logout: (refreshToken) =>
    request('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }),

  // --- journals (all require the access token) ---
  getJournals: () => request('/journals'),
  getHeatmap: () => request('/journals/heatmap'),
  getDashboard: () => request('/dashboard'),

  // --- daily reviews ---
  getReview: (dateStr) => request(`/reviews/${dateStr}`),
  upsertReview: (dateStr, content) =>
    request(`/reviews/${dateStr}`, { method: 'PUT', body: { content } }),
  getReviewsInRange: (startStr, endStr) =>
    request(`/reviews?start=${startStr}&end=${endStr}`),
  deleteReview: (dateStr) => request(`/reviews/${dateStr}`, { method: 'DELETE' }),
  getJournal: (id) => request(`/journals/${id}`),
  createJournal: (payload) => request('/journals', { method: 'POST', body: payload }),
  updateJournal: (id, payload) => request(`/journals/${id}`, { method: 'PUT', body: payload }),
  deleteJournal: (id) => request(`/journals/${id}`, { method: 'DELETE' })
}

export { ApiError }
