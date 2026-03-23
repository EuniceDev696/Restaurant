import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createId, readStore, writeStore } from './lib/store.js'

const app = express()
const PORT = Number(globalThis.process?.env?.PORT || 4000)
const SLOT_CAPACITY = Number(process.env.SLOT_CAPACITY || 24)
const SLOT_TIMES = ['17:30', '18:30', '19:30', '20:30', '21:30']
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '..', 'dist')
const hasBuiltFrontend = fs.existsSync(distPath)
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function isReservationActive(status) {
  return status !== 'cancelled'
}

function normalizeGuests(rawGuests) {
  const guests = Number(rawGuests)
  if (!Number.isFinite(guests) || guests <= 0) return null
  return Math.min(guests, 20)
}

function buildSlotAvailability(store, date) {
  const reservations = Array.isArray(store?.reservations) ? store.reservations : []
  return SLOT_TIMES.map((time) => {
    const reserved = reservations
      .filter((item) => item.date === date && item.time === time && isReservationActive(item.status))
      .reduce((sum, item) => sum + Number(item.guests || 0), 0)
    const remaining = Math.max(0, SLOT_CAPACITY - reserved)
    return {
      time,
      capacity: SLOT_CAPACITY,
      reserved,
      remaining,
      available: remaining > 0,
    }
  })
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (!allowedOrigins.length) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('CORS origin blocked'))
    },
  }),
)
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'restaurant-api' })
})

app.get('/api/ready', async (_req, res) => {
  try {
    const store = await readStore()
    const isValid =
      store &&
      Array.isArray(store.menu) &&
      Array.isArray(store.events) &&
      Array.isArray(store.reservations)
    if (!isValid) return res.status(503).json({ ok: false, message: 'Store shape invalid.' })
    return res.json({ ok: true, ready: true })
  } catch {
    return res.status(503).json({ ok: false, message: 'Store unavailable.' })
  }
})

app.get('/api/menu', async (_req, res) => {
  const store = await readStore()
  res.json(store.menu)
})

app.post('/api/menu', async (req, res) => {
  const { name, category, image, hoverImage, ingredients, notes, allergens, dietary, available } = req.body || {}
  if (!name || !category || !image) {
    return res.status(400).json({ message: 'Menu item requires name, category, and image.' })
  }

  const store = await readStore()
  const record = {
    id: createId('M'),
    name,
    category,
    image,
    hoverImage: hoverImage || image,
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    notes: notes || 'Chef-crafted seasonal preparation.',
    allergens: allergens || 'None',
    dietary: Array.isArray(dietary) ? dietary : [],
    available: available !== false,
  }
  store.menu.unshift(record)
  await writeStore(store)
  return res.status(201).json({ ok: true, menu: record })
})

app.delete('/api/menu/:id', async (req, res) => {
  const { id } = req.params
  const store = await readStore()
  const index = store.menu.findIndex((item) => item.id === id)
  if (index < 0) return res.status(404).json({ message: 'Menu item not found.' })
  const [removed] = store.menu.splice(index, 1)
  await writeStore(store)
  return res.json({ ok: true, menu: removed })
})

app.get('/api/events', async (_req, res) => {
  const store = await readStore()
  res.json(store.events)
})

app.post('/api/events', async (req, res) => {
  const { title, date, summary, capacity, sold } = req.body || {}
  if (!title || !date || !summary) {
    return res.status(400).json({ message: 'Event requires title, date, and summary.' })
  }

  const store = await readStore()
  const record = {
    id: createId('E'),
    title,
    date,
    summary,
    capacity: Number(capacity) > 0 ? Number(capacity) : null,
    sold: Number(sold) >= 0 ? Number(sold) : null,
  }
  store.events.unshift(record)
  await writeStore(store)
  return res.status(201).json({ ok: true, event: record })
})

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params
  const store = await readStore()
  const index = store.events.findIndex((item) => item.id === id)
  if (index < 0) return res.status(404).json({ message: 'Event not found.' })
  const [removed] = store.events.splice(index, 1)
  await writeStore(store)
  return res.json({ ok: true, event: removed })
})

app.get('/api/reservations', async (_req, res) => {
  const store = await readStore()
  res.json(store.reservations)
})

app.get('/api/reservations/availability', async (req, res) => {
  const date = String(req.query.date || '').slice(0, 10)
  const guests = normalizeGuests(req.query.guests || 2) || 2
  if (!date) return res.status(400).json({ message: 'Date is required (YYYY-MM-DD).' })

  const store = await readStore()
  const slots = buildSlotAvailability(store, date).map((slot) => ({
    ...slot,
    available: slot.remaining >= guests,
  }))
  return res.json({ date, guests, slots })
})

app.post('/api/reservations', async (req, res) => {
  const { date, time, guests, email, requests = '', depositOptIn = false } = req.body || {}
  const normalizedGuests = normalizeGuests(guests)
  if (!date || !time || !normalizedGuests || !email) {
    return res.status(400).json({ message: 'Missing required reservation fields.' })
  }
  if (!SLOT_TIMES.includes(time)) {
    return res.status(400).json({ message: 'Selected time is unavailable for online booking.' })
  }

  const store = await readStore()
  const slot = buildSlotAvailability(store, date).find((item) => item.time === time)
  if (!slot || slot.remaining < normalizedGuests) {
    return res.status(409).json({ message: 'Selected time is fully booked. Please choose another slot.' })
  }

  const depositAmount = depositOptIn ? normalizedGuests * 15000 : 0
  const record = {
    id: createId('R'),
    guest: email.split('@')[0].replace(/[._]/g, ' '),
    date,
    time,
    guests: normalizedGuests,
    email,
    requests,
    depositOptIn: Boolean(depositOptIn),
    depositAmount,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  store.reservations.unshift(record)
  await writeStore(store)
  return res.status(201).json({ ok: true, confirmationId: record.id, reservation: record })
})

app.post('/api/reservations/cancel', async (req, res) => {
  const { confirmationId, email } = req.body || {}
  if (!confirmationId || !email) {
    return res.status(400).json({ message: 'Confirmation ID and email are required.' })
  }

  const store = await readStore()
  const target = store.reservations.find(
    (item) =>
      item.id.toLowerCase() === String(confirmationId).toLowerCase() &&
      item.email.toLowerCase() === String(email).toLowerCase(),
  )

  if (!target) return res.status(404).json({ message: 'Reservation not found for this email.' })
  target.status = 'cancelled'
  await writeStore(store)
  return res.json({ ok: true, reservation: target })
})

app.patch('/api/reservations/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body || {}
  const allowed = new Set(['pending', 'confirmed', 'seated', 'cancelled'])
  if (!allowed.has(status)) {
    return res.status(400).json({ message: 'Invalid status.' })
  }

  const store = await readStore()
  const target = store.reservations.find((item) => item.id === id)
  if (!target) return res.status(404).json({ message: 'Reservation not found.' })
  target.status = status
  await writeStore(store)
  return res.json({ ok: true, reservation: target })
})

app.delete('/api/reservations/:id', async (req, res) => {
  const { id } = req.params
  const store = await readStore()
  const index = store.reservations.findIndex((item) => item.id === id)
  if (index < 0) return res.status(404).json({ message: 'Reservation not found.' })
  const target = store.reservations[index]
  if (target.status !== 'cancelled') {
    return res.status(400).json({ message: 'Only cancelled reservations can be removed.' })
  }
  const [removed] = store.reservations.splice(index, 1)
  await writeStore(store)
  return res.json({ ok: true, reservation: removed })
})

app.patch('/api/menu/:id/availability', async (req, res) => {
  const { id } = req.params
  const { available } = req.body || {}
  const store = await readStore()
  const target = store.menu.find((item) => item.id === id)
  if (!target) return res.status(404).json({ message: 'Menu item not found.' })
  target.available = Boolean(available)
  await writeStore(store)
  return res.json({ ok: true, menu: target })
})

app.get('/api/admin/summary', async (_req, res) => {
  const store = await readStore()
  res.json({
    reservations: store.reservations,
    menu: store.menu,
    events: store.events,
  })
})

if (hasBuiltFrontend) {
  app.use(express.static(distPath))

  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use((error, _req, res, _next) => {
  if (String(error?.message || '').includes('CORS')) {
    return res.status(403).json({ message: 'CORS blocked for this origin.' })
  }
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Upload payload is too large. Use a smaller image (<= 12MB).' })
  }
  console.error(error)
  return res.status(500).json({ message: 'Internal server error.' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Restaurant API listening on http://localhost:${PORT}`)
})
