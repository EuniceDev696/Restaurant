const API_BASE =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api')
let seedStorePromise = null

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `API request failed: ${response.status}`)
  }
  return response.json()
}

async function readSeedStore() {
  // Cache the seed-store request so we do not fetch the same file repeatedly.
  if (!seedStorePromise) {
    seedStorePromise = fetch('/seed-store.json').then((response) => {
      if (!response.ok) throw new Error(`Seed store failed: ${response.status}`)
      return response.json()
    })
  }
  return seedStorePromise
}

export async function fetchMenuItems() {
  try {
    return await request('/menu')
  } catch {
    // Offline/development fallback when backend is not running.
    const seed = await readSeedStore()
    return Array.isArray(seed.menu) ? seed.menu : []
  }
}

export async function fetchEvents() {
  try {
    return await request('/events')
  } catch {
    // Offline/development fallback when backend is not running.
    const seed = await readSeedStore()
    return Array.isArray(seed.events) ? seed.events : []
  }
}

export async function submitReservation(payload) {
  return request('/reservations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function cancelReservation(payload) {
  return request('/reservations/cancel', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchReservationAvailability(date, guests = 2) {
  try {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    params.set('guests', String(guests))
    return await request(`/reservations/availability?${params.toString()}`)
  } catch {
    // Offline/development fallback when backend is not running.
    const defaultSlots = ['17:30', '18:30', '19:30', '20:30', '21:30']
    return {
      date,
      slots: defaultSlots.map((time) => ({
        time,
        capacity: 24,
        reserved: 0,
        remaining: 24,
        available: true,
      })),
    }
  }
}
