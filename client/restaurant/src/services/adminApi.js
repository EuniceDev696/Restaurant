const API_BASE =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api')

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: options.signal || controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Ensure the backend API is running.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `API request failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchAdminData() {
  return request('/admin/summary')
}

export async function updateReservationStatus(id, status) {
  return request(`/reservations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function deleteReservation(id) {
  return request(`/reservations/${id}`, {
    method: 'DELETE',
  })
}

export async function updateMenuAvailability(id, available) {
  return request(`/menu/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ available }),
  })
}

export async function createMenuItem(payload) {
  return request('/menu', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteMenuItem(id) {
  return request(`/menu/${id}`, {
    method: 'DELETE',
  })
}

export async function createEvent(payload) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteEvent(id) {
  return request(`/events/${id}`, {
    method: 'DELETE',
  })
}
