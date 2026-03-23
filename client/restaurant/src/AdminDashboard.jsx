import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createEvent,
  createMenuItem,
  deleteReservation,
  deleteEvent,
  deleteMenuItem,
  fetchAdminData,
  updateMenuAvailability,
  updateReservationStatus,
} from './services/adminApi'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsDataURL(file)
  })
}

function AdminDashboard() {
  const inputClass =
    'rounded-md border border-white/20 bg-[#181818] px-3 py-2 text-sm text-[#f5f0e6] placeholder:text-[#f5f0e6]/55 outline-none focus:border-[#c9a46a]/70'
  const selectClass =
    'rounded-md border border-white/20 bg-[#181818] px-3 py-2 text-sm text-[#f5f0e6] outline-none focus:border-[#c9a46a]/70'
  const [activeSection, setActiveSection] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [menuSubmitting, setMenuSubmitting] = useState(false)
  const [eventSubmitting, setEventSubmitting] = useState(false)
  const [reservations, setReservations] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [events, setEvents] = useState([])
  const [searchGuest, setSearchGuest] = useState('')
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'Main',
    image: '',
    notes: '',
    ingredients: '',
    allergens: '',
  })
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    summary: '',
    capacity: '',
  })
  const [adminMessage, setAdminMessage] = useState('')
  const eventDateInputRef = useRef(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchAdminData()
        if (!mounted) return
        setReservations(Array.isArray(data?.reservations) ? data.reservations : [])
        setMenuItems(Array.isArray(data?.menu) ? data.menu : [])
        setEvents(Array.isArray(data?.events) ? data.events : [])
      } catch (error) {
        if (!mounted) return
        setAdminMessage(`Unable to load admin data: ${error.message}`)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayReservations = reservations.filter((item) => item.date === today && item.status !== 'cancelled')
    const covers = todayReservations.reduce((sum, item) => sum + item.guests, 0)
    return {
      reservationsToday: todayReservations.length,
      coversToday: covers,
      activeEvents: events.length,
    }
  }, [reservations, events])

  const filteredReservations = useMemo(() => {
    const q = searchGuest.trim().toLowerCase()
    if (!q) return reservations
    return reservations.filter((item) => item.guest.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
  }, [reservations, searchGuest])

  const updateReservationStatusLocal = async (id, status) => {
    try {
      const response = await updateReservationStatus(id, status)
      const nextReservation = response.reservation
      setReservations((prev) => prev.map((item) => (item.id === id ? nextReservation : item)))
      setAdminMessage(`Reservation ${id} updated to ${status}.`)
    } catch (error) {
      setAdminMessage(`Unable to update reservation: ${error.message}`)
    }
  }

  const removeCancelledReservationLocal = async (id) => {
    try {
      await deleteReservation(id)
      setReservations((prev) => prev.filter((item) => item.id !== id))
      setAdminMessage(`Cancelled reservation ${id} removed.`)
    } catch (error) {
      setAdminMessage(`Unable to remove reservation: ${error.message}`)
    }
  }

  const toggleMenuAvailabilityLocal = async (id) => {
    const target = menuItems.find((item) => item.id === id)
    if (!target) return
    try {
      const response = await updateMenuAvailability(id, !target.available)
      const nextMenu = response.menu
      setMenuItems((prev) => prev.map((item) => (item.id === id ? nextMenu : item)))
      setAdminMessage(`Availability updated for ${nextMenu.name}.`)
    } catch (error) {
      setAdminMessage(`Unable to update availability: ${error.message}`)
    }
  }

  const handleMenuFormInput = (event) => {
    const { name, value } = event.target
    setMenuForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEventFormInput = (event) => {
    const { name, value } = event.target
    setEventForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateMenuItem = async (event) => {
    event.preventDefault()
    if (!menuForm.image.trim()) {
      setAdminMessage('Menu upload failed: Please add an image URL or upload a file.')
      return
    }
    setMenuSubmitting(true)
    try {
      const payload = {
        ...menuForm,
        ingredients: menuForm.ingredients
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        dietary: [],
      }
      const response = await createMenuItem(payload)
      setMenuItems((prev) => [response.menu, ...prev])
      setMenuForm({ name: '', category: 'Main', image: '', notes: '', ingredients: '', allergens: '' })
      setAdminMessage(`Menu item added: ${response.menu.name}`)
    } catch (error) {
      setAdminMessage(`Menu upload failed: ${error.message}`)
    } finally {
      setMenuSubmitting(false)
    }
  }

  const handleMenuImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setMenuForm((prev) => ({ ...prev, image: dataUrl }))
      setAdminMessage(`Image selected: ${file.name}`)
    } catch (error) {
      setAdminMessage(`Image upload failed: ${error.message}`)
    }
  }

  const handleDeleteMenuItem = async (id) => {
    try {
      await deleteMenuItem(id)
      setMenuItems((prev) => prev.filter((item) => item.id !== id))
      setAdminMessage('Menu item removed.')
    } catch (error) {
      setAdminMessage(`Unable to remove menu item: ${error.message}`)
    }
  }

  const handleCreateEvent = async (event) => {
    event.preventDefault()
    setEventSubmitting(true)
    try {
      const response = await createEvent({
        ...eventForm,
        capacity: eventForm.capacity ? Number(eventForm.capacity) : null,
        sold: null,
      })
      setEvents((prev) => [response.event, ...prev])
      setEventForm({ title: '', date: '', summary: '', capacity: '' })
      setAdminMessage(`Event added: ${response.event.title}`)
    } catch (error) {
      setAdminMessage(`Unable to add event: ${error.message}`)
    } finally {
      setEventSubmitting(false)
    }
  }

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id)
      setEvents((prev) => prev.filter((item) => item.id !== id))
      setAdminMessage('Event removed.')
    } catch (error) {
      setAdminMessage(`Unable to remove event: ${error.message}`)
    }
  }

  const openDateTimePicker = () => {
    const node = eventDateInputRef.current
    if (!node) return
    if (typeof node.showPicker === 'function') {
      node.showPicker()
      return
    }
    node.focus()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111214] text-[#f5f0e6]">
        Loading admin dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111214] text-[#f5f0e6]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px,1fr]">
        <aside className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="font-serif text-3xl text-[#f5f0e6]">Atelier Noir</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#c9a46a]">Admin Dashboard</p>
          <div className="mt-6 space-y-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'reservations', label: 'Reservations' },
              { id: 'menu', label: 'Menu Control' },
              { id: 'events', label: 'Events' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                  activeSection === item.id
                    ? 'border-[#c9a46a]/80 bg-[#c9a46a]/10 text-[#c9a46a]'
                    : 'border-white/10 text-[#f5f0e6]/80 hover:border-[#c9a46a]/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          <header className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#c9a46a]">Operations</p>
            <h1 className="mt-2 font-serif text-5xl">Restaurant Control Center</h1>
            <p className="mt-2 text-sm text-[#f5f0e6]/75">Live command view for reservations, service flow, events, and direct channels.</p>
            {adminMessage ? <p className="mt-3 text-xs uppercase tracking-[0.16em] text-emerald-300">{adminMessage}</p> : null}
          </header>

          {(activeSection === 'overview' || activeSection === 'reservations') && (
            <section className="space-y-4">
              {activeSection === 'overview' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c9a46a]">Reservations Today</p>
                    <p className="mt-2 font-serif text-4xl">{stats.reservationsToday}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c9a46a]">Covers Today</p>
                    <p className="mt-2 font-serif text-4xl">{stats.coversToday}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c9a46a]">Active Events</p>
                    <p className="mt-2 font-serif text-4xl">{stats.activeEvents}</p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-serif text-3xl">Reservations</h2>
                  <input
                    value={searchGuest}
                    onChange={(event) => setSearchGuest(event.target.value)}
                    placeholder="Search guest or reservation ID"
                    className={inputClass}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.16em] text-[#c9a46a]">
                      <tr>
                        <th className="py-2">ID</th>
                        <th className="py-2">Guest</th>
                        <th className="py-2">Date</th>
                        <th className="py-2">Time</th>
                        <th className="py-2">Guests</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((item) => (
                        <tr key={item.id} className="border-t border-white/10">
                          <td className="py-3">{item.id}</td>
                          <td className="py-3">{item.guest}</td>
                          <td className="py-3">{item.date}</td>
                          <td className="py-3">{item.time}</td>
                          <td className="py-3">{item.guests}</td>
                          <td className="py-3">
                            <select
                              value={item.status}
                              onChange={(event) => updateReservationStatusLocal(item.id, event.target.value)}
                              className="rounded border border-white/20 bg-[#181818] px-2 py-1 text-xs uppercase tracking-[0.14em] text-[#f5f0e6] outline-none"
                            >
                              <option value="pending" className="bg-[#181818] text-[#f5f0e6]">Pending</option>
                              <option value="confirmed" className="bg-[#181818] text-[#f5f0e6]">Confirmed</option>
                              <option value="seated" className="bg-[#181818] text-[#f5f0e6]">Seated</option>
                              <option value="cancelled" className="bg-[#181818] text-[#f5f0e6]">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3">
                            {item.status === 'cancelled' ? (
                              <button
                                type="button"
                                onClick={() => removeCancelledReservationLocal(item.id)}
                                className="rounded border border-rose-400/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-rose-300 transition hover:bg-rose-500/15"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="text-[10px] uppercase tracking-[0.14em] text-[#f5f0e6]/45">
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'menu' && (
            <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <h2 className="font-serif text-3xl">Menu Availability</h2>
              <form className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-black/30 p-4 md:grid-cols-2" onSubmit={handleCreateMenuItem}>
                <input
                  name="name"
                  value={menuForm.name}
                  onChange={handleMenuFormInput}
                  placeholder="Dish name"
                  required
                  className={inputClass}
                />
                <select
                  name="category"
                  value={menuForm.category}
                  onChange={handleMenuFormInput}
                  className={selectClass}
                >
                  <option value="Starters" className="bg-[#181818] text-[#f5f0e6]">Starters</option>
                  <option value="Main" className="bg-[#181818] text-[#f5f0e6]">Main</option>
                  <option value="African Special" className="bg-[#181818] text-[#f5f0e6]">African Special</option>
                  <option value="Dessert" className="bg-[#181818] text-[#f5f0e6]">Dessert</option>
                  <option value="Drinks" className="bg-[#181818] text-[#f5f0e6]">Drinks</option>
                </select>
                <input
                  name="image"
                  value={menuForm.image}
                  onChange={handleMenuFormInput}
                  placeholder="Image URL"
                  required
                  className={`${inputClass} md:col-span-2`}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMenuImageUpload}
                  className="rounded-md border border-white/20 bg-[#181818] px-3 py-2 text-sm text-[#f5f0e6] file:mr-3 file:rounded file:border-0 file:bg-[#c9a46a]/15 file:px-3 file:py-1 file:text-xs file:uppercase file:tracking-[0.12em] file:text-[#c9a46a] md:col-span-2"
                />
                <input
                  name="ingredients"
                  value={menuForm.ingredients}
                  onChange={handleMenuFormInput}
                  placeholder="Ingredients (comma separated)"
                  className={inputClass}
                />
                <input
                  name="allergens"
                  value={menuForm.allergens}
                  onChange={handleMenuFormInput}
                  placeholder="Allergens"
                  className={inputClass}
                />
                <textarea
                  name="notes"
                  value={menuForm.notes}
                  onChange={handleMenuFormInput}
                  placeholder="Chef notes"
                  className={`min-h-[80px] ${inputClass} md:col-span-2`}
                />
                <button
                  type="submit"
                  disabled={menuSubmitting}
                  className="rounded-md border border-[#c9a46a]/70 bg-[#c9a46a]/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#c9a46a] transition hover:bg-[#c9a46a]/20 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
                >
                  {menuSubmitting ? 'Adding...' : 'Add Menu Item'}
                </button>
              </form>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
                    <div>
                      <p className="font-serif text-2xl">{item.name}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-[#c9a46a]">{item.category}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleMenuAvailabilityLocal(item.id)}
                        className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.16em] ${
                          item.available ? 'border-emerald-400/70 text-emerald-300' : 'border-rose-400/70 text-rose-300'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="rounded-md border border-rose-400/70 px-3 py-2 text-xs uppercase tracking-[0.16em] text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'events' && (
            <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <h2 className="font-serif text-3xl">Events Performance</h2>
              <form className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-black/30 p-4 md:grid-cols-2" onSubmit={handleCreateEvent}>
                <input
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormInput}
                  placeholder="Event title"
                  required
                  className={inputClass}
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={eventDateInputRef}
                    name="date"
                    type="datetime-local"
                    value={eventForm.date}
                    onChange={handleEventFormInput}
                    required
                    className={`w-full ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={openDateTimePicker}
                    className="rounded-md border border-[#c9a46a]/65 px-2 py-2 text-[10px] uppercase tracking-[0.12em] text-[#c9a46a] transition hover:bg-[#c9a46a]/12"
                  >
                    Pick
                  </button>
                </div>
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  value={eventForm.capacity}
                  onChange={handleEventFormInput}
                  placeholder="Capacity"
                  className={inputClass}
                />
                <textarea
                  name="summary"
                  value={eventForm.summary}
                  onChange={handleEventFormInput}
                  placeholder="Event summary"
                  required
                  className={`min-h-[80px] ${inputClass} md:col-span-2`}
                />
                <button
                  type="submit"
                  disabled={eventSubmitting}
                  className="rounded-md border border-[#c9a46a]/70 bg-[#c9a46a]/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#c9a46a] transition hover:bg-[#c9a46a]/20 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
                >
                  {eventSubmitting ? 'Adding...' : 'Add Event'}
                </button>
              </form>
              <div className="mt-4 space-y-4">
                {events.map((event) => {
                  const hasSeatData =
                    Number.isFinite(Number(event.capacity)) &&
                    Number(event.capacity) > 0 &&
                    Number.isFinite(Number(event.sold)) &&
                    Number(event.sold) >= 0
                  const percent = hasSeatData ? Math.round((Number(event.sold) / Number(event.capacity)) * 100) : 0
                  return (
                    <div key={event.id} className="rounded-lg border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-serif text-2xl">{event.title}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-[#c9a46a]">{event.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {hasSeatData ? <p className="text-sm text-[#f5f0e6]/80">{event.sold}/{event.capacity} seats</p> : null}
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="rounded-md border border-rose-400/70 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      {event.summary ? <p className="mt-2 text-sm text-[#f5f0e6]/70">{event.summary}</p> : null}
                      {hasSeatData ? (
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[#c9a46a]" style={{ width: `${percent}%` }} />
                        </div>
                      ) : (
                        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#c9a46a]/90">Seat count pending release</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
