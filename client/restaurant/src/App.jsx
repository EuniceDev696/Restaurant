import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import AnimatedText from './components/AnimatedText'
import LuxButton from './components/LuxButton'
import SectionWrapper from './components/SectionWrapper'
import { trackEvent } from './services/analytics'
import {
  cancelReservation,
  fetchEvents,
  fetchMenuItems,
  fetchReservationAvailability,
  submitReservation,
} from './services/mockApi'

const menuCategories = ['Starters', 'Main', 'African Special', 'Dessert', 'Drinks']
const menuSpecialCategories = ['Gluten-Free', 'Nut-Free', 'Drink Categories']
const cravingOptions = ['Spicy', 'Light', 'Romantic', 'Vegetarian', 'Luxury Tasting']
const reservationDefaults = {
  date: '',
  guests: '2',
  time: '',
  email: '',
  requests: '',
  depositOptIn: false,
}
const testimonials = [
  {
    quote:
      'From the welcome to dessert, every detail felt deliberate and warm. It is the place we now choose for milestones.',
    author: 'Adaeze O.',
    detail: 'Private Anniversary Dinner',
  },
  {
    quote:
      'Service pace was perfect and the tasting menu was cohesive from first bite to last. The wine pairing elevated every course.',
    author: 'Tunde A.',
    detail: 'Chef Tasting Guest',
  },
  {
    quote:
      'The room feels elegant but relaxed, and the team handles requests with care. It is refined dining without stiffness.',
    author: 'Mariam E.',
    detail: 'Corporate Host',
  },
]
const drinkCategories = {
  'Signature Cocktails': [
    'Smoky Citrus Martini',
    'Lagos Nights Old Fashioned',
    'Spiced Rum Fizz',
    'Tropical Passion Spritz',
  ],
  'Non-Alcoholic': [
    'Citrus and Ginger Sparkler',
    'Hibiscus Iced Tea',
    'Coconut Water Cooler',
  ],
  'Wine Pairings': ['Chardonnay Pairing', 'Pinot Noir Pairing', 'Sauvignon Blanc Pairing'],
}
// Image configs use local files first; fallback URLs keep the UI usable before assets are added.
const menuImageFallback = `${import.meta.env.BASE_URL}images/menu-placeholder.svg`
const heroSlides = [
  {
    local: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1600&q=65&fm=webp',
    fallback: `${import.meta.env.BASE_URL}images/hero-1.svg`,
    alt: 'Luxury plated dish with warm cinematic lighting',
  },
  {
    local: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=65&fm=webp',
    fallback: `${import.meta.env.BASE_URL}images/hero-2.svg`,
    alt: 'Fine dining room atmosphere at night',
  },
  {
    local: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=65&fm=webp',
    fallback: `${import.meta.env.BASE_URL}images/hero-3.svg`,
    alt: 'Chef-prepared dish with garnish closeup',
  },
  {
    local: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=65&fm=webp',
    fallback: `${import.meta.env.BASE_URL}images/hero-4.svg`,
    alt: 'Chef finishing a dish during service',
  },
]

const chefImages = {
  primary: {
    local: `${import.meta.env.BASE_URL}images/chef-1.svg`,
    fallback: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1000&q=80&fm=webp',
  },
  secondary: {
    local: `${import.meta.env.BASE_URL}images/chef-2.svg`,
    fallback: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=900&q=80&fm=webp',
  },
  tertiary: {
    local: `${import.meta.env.BASE_URL}images/chef-3.svg`,
    fallback: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80&fm=webp',
  },
}

const galleryItems = [
  {
    src: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1600&q=75&fm=webp',
    fallback: `${import.meta.env.BASE_URL}images/gallery-1.svg`,
    alt: 'Chef finishing a plated tasting course in the evening kitchen',
  },
  {
    src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=75&fm=webp',
    fallback: `${import.meta.env.BASE_URL}images/gallery-2.svg`,
    alt: 'Candlelit dining setup with refined tableware',
  },
  {
    src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=75&fm=webp',
    fallback: `${import.meta.env.BASE_URL}images/gallery-3.svg`,
    alt: 'Fine-dining interior atmosphere during dinner service',
  },
  {
    src: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1600&q=75&fm=webp',
    fallback: `${import.meta.env.BASE_URL}images/gallery-4.svg`,
    alt: 'Close-up of elegant plated cuisine ready for service',
  },
]
const closingImage = {
  src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80&fm=webp',
  fallback: `${import.meta.env.BASE_URL}images/closing-evening.svg`,
}

const farmToPlateIntro = [
  'We source the finest local ingredients, hand-picked by artisans and farmers we trust.',
  'Each ingredient is treated with care, respecting its story.',
  'Every plate that reaches your table is crafted to delight your senses.',
]

const farmToPlateSteps = [
  {
    id: 'farm',
    title: 'Farm',
    heading: 'Harvested from trusted local farms',
    body: 'We source fresh produce, herbs, and seasonal ingredients from trusted local farms. Every item is selected for its quality, flavor, and character.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80&fm=webp',
    note: 'Heirloom greens from partner farms',
  },
  {
    id: 'harvest',
    title: 'Harvest',
    heading: 'Prepared with precision and respect',
    body: 'Ingredients are carefully cleaned, portioned, and seasoned to preserve their natural flavor and quality. Every step is handled with precision and respect.',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80&fm=webp',
    note: 'Daily prep, no overnight compromise',
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    heading: 'Crafted in the heart of our kitchen',
    body: 'In our kitchen, heat, aroma, and technique come together to create dishes with perfect texture and balance. Every plate is carefully crafted to deliver a consistent and thoughtful dining experience.',
    image: `${import.meta.env.BASE_URL}images/kitchen.png`,
    note: 'Chef-finished with signature reductions',
  },
  {
    id: 'table',
    title: 'Table',
    heading: 'Served to delight every sense',
    body: 'Each dish is plated with care and elegance to provide a complete and satisfying dining experience. Every course is served to engage your senses.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80&fm=webp',
    note: 'Final plating under service lights',
  },
]

const defaultExclusiveEvents = []

const nycHours = {
  Mon: { open: 17 * 60 + 30, close: 22 * 60 + 30 },
  Tue: { open: 17 * 60 + 30, close: 22 * 60 + 30 },
  Wed: { open: 17 * 60 + 30, close: 22 * 60 + 30 },
  Thu: { open: 17 * 60 + 30, close: 22 * 60 + 30 },
  Fri: { open: 17 * 60 + 30, close: 23 * 60 + 30 },
  Sat: { open: 15 * 60, close: 23 * 60 + 30 },
  Sun: { open: 15 * 60, close: 22 * 60 },
}
const reservationTimeOptions = ['17:30', '18:30', '19:30', '20:30', '21:30']

function getCountdown(targetDate, nowTimestamp) {
  const diff = new Date(targetDate).getTime() - nowTimestamp
  if (diff <= 0) return null

  const totalMinutes = Math.floor(diff / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  return { days, hours, minutes }
}

function getLiveHoursStatus(nowTimestamp) {
  const now = new Date(nowTimestamp)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const day = values.weekday
  const hour = Number(values.hour)
  const minute = Number(values.minute)
  const minutesNow = hour * 60 + minute
  const schedule = nycHours[day]

  if (!schedule) return { label: 'Hours Unavailable', tone: 'text-ivory/80' }

  if (minutesNow < schedule.open) {
    if (schedule.open - minutesNow <= 60) {
      return { label: 'Opening Soon', tone: 'text-amber-300' }
    }
    return { label: 'Closed Now', tone: 'text-rose-300' }
  }

  if (minutesNow >= schedule.close) {
    return { label: 'Closed Now', tone: 'text-rose-300' }
  }

  if (schedule.close - minutesNow <= 45) {
    return { label: 'Closing Soon', tone: 'text-amber-300' }
  }

  return { label: 'Open Now', tone: 'text-emerald-300' }
}

function matchesCraving(item, craving) {
  if (!craving) return false
  const name = String(item.name || '').toLowerCase()
  const notes = String(item.notes || '').toLowerCase()
  const dietary = Array.isArray(item.dietary) ? item.dietary.map((d) => String(d).toLowerCase()) : []

  if (craving === 'Spicy') {
    // Explicit spicy mapping (excluding Moi Moi and Egusi).
    return (
      name.includes('suya') ||
      name.includes('asun') ||
      name.includes('pepper soup') ||
      name.includes('jollof rice with grilled chicken or prawns') ||
      name.includes('peppercorn crusted beef tenderloin') ||
      name.includes('chili grilled prawns') ||
      name.includes('spicy jollof risotto') ||
      notes.includes('spicy')
    )
  }

  if (craving === 'Light') {
    return ['Starters', 'Main', 'Dessert'].includes(item.category)
  }

  if (craving === 'Romantic') {
    return ['Starters', 'Main', 'Dessert'].includes(item.category)
  }

  if (craving === 'Vegetarian') {
    return (
      dietary.includes('vegan') ||
      dietary.includes('vegetarian') ||
      name.includes('grilled portobello with truffle mash') ||
      name.includes('smoked cauliflower steak') ||
      name.includes('wild mushroom risotto')
    )
  }

  if (craving === 'Luxury Tasting') {
    return (
      name.includes('wagyu beef with truffle emulsion') ||
      name.includes('seared scallops') ||
      name.includes('dark chocolate & gold leaf mousse') ||
      name.includes('lobster linguine') ||
      name.includes('filet mignon for two') ||
      name.includes('caviar') ||
      name.includes('tenderloin')
    )
  }

  return false
}

function buildDishSuggestions(selectedDish, allMenuItems) {
  if (!selectedDish || !Array.isArray(allMenuItems)) return []
  const selectedIngredients = (selectedDish.ingredients || []).map((item) => String(item).toLowerCase())

  const scored = allMenuItems
    .filter((item) => item.id !== selectedDish.id && item.available !== false && item.category !== 'Drinks')
    .map((item) => {
      const itemIngredients = (item.ingredients || []).map((value) => String(value).toLowerCase())
      const sharedIngredients = selectedIngredients.filter((token) => itemIngredients.includes(token)).length
      const sameCategory = item.category === selectedDish.category ? 2 : 0
      const pairingBonus =
        selectedDish.category === 'Main' && item.category === 'Dessert'
          ? 1
          : selectedDish.category === 'Dessert' && item.category === 'Main'
            ? 1
            : 0
      return { ...item, score: sharedIngredients + sameCategory + pairingBonus }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 4)
}

function buildDrinkSuggestions(selectedDish, allMenuItems) {
  if (!selectedDish || !Array.isArray(allMenuItems) || selectedDish.category === 'Drinks') return []

  const selectedName = String(selectedDish.name || '').toLowerCase()
  const selectedNotes = String(selectedDish.notes || '').toLowerCase()

  const scored = allMenuItems
    .filter((item) => item.available !== false && item.category === 'Drinks')
    .map((item) => {
      const itemName = String(item.name || '').toLowerCase()
      const itemNotes = String(item.notes || '').toLowerCase()

      let score = 0

      if (itemName.includes('pairing')) score += 2
      if (
        (selectedName.includes('scallops') || selectedName.includes('lobster')) &&
        itemName.includes('chardonnay')
      ) {
        score += 3
      }
      if (
        (selectedName.includes('wagyu') || selectedName.includes('lamb') || selectedName.includes('tenderloin')) &&
        itemName.includes('pinot noir')
      ) {
        score += 3
      }
      if (
        (selectedName.includes('sea bass') || selectedName.includes('jollof')) &&
        itemName.includes('sauvignon')
      ) {
        score += 3
      }
      if (
        (selectedNotes.includes('spicy') || selectedName.includes('pepper') || selectedName.includes('suya')) &&
        (itemName.includes('sparkler') || itemName.includes('hibiscus') || itemName.includes('coconut water'))
      ) {
        score += 2
      }
      if (
        (selectedName.includes('dessert') ||
          selectedName.includes('mousse') ||
          selectedName.includes('fondant') ||
          selectedName.includes('brulee')) &&
        (itemName.includes('martini') || itemName.includes('old fashioned'))
      ) {
        score += 1
      }

      return { ...item, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 3)
}

function validateReservation(data) {
  const errors = {}
  if (!data.date) errors.date = 'Please choose a date.'
  if (!data.time) errors.time = 'Please choose a time.'
  if (!data.guests) errors.guests = 'Please choose guest count.'
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email.'
  return errors
}

function withFallback(event, fallback) {
  // Prevent an infinite onError loop by only applying fallback once.
  if (!fallback) return
  if (event.currentTarget.dataset.fallbackApplied === 'true') return
  event.currentTarget.dataset.fallbackApplied = 'true'
  event.currentTarget.src = fallback
}

function resolveImagePath(src) {
  if (!src || typeof src !== 'string') return menuImageFallback
  if (src.startsWith('/images/')) return `${import.meta.env.BASE_URL}${src.slice(1)}`
  return src
}

function App() {
  // UI filter + content state.
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(menuCategories[0])
  const [activeCraving, setActiveCraving] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [eventsData, setEventsData] = useState(defaultExclusiveEvents)
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState('')
  // Dish modal state; returnToFullMenu tracks whether "Back to Full Menu" should be shown.
  const [selectedDish, setSelectedDish] = useState(null)
  const [returnToFullMenu, setReturnToFullMenu] = useState(false)
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false)
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false)
  const [quickReserve, setQuickReserve] = useState({ date: '', time: '', guests: '2' })
  const [formState, setFormState] = useState(reservationDefaults)
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitState, setSubmitState] = useState('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [manageReservationUrl, setManageReservationUrl] = useState('')
  const [cancelState, setCancelState] = useState('idle')
  const [cancelMessage, setCancelMessage] = useState('')
  const [cancelForm, setCancelForm] = useState({ confirmationId: '', email: '' })
  const [nowTimestamp, setNowTimestamp] = useState(0)

  const reserveRef = useRef(null)
  const modalRef = useRef(null)
  const reserveDateInputRef = useRef(null)
  const quickDateInputRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const activeHeroSlide = heroSlides[heroSlideIndex]

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    // Keep a minute-level clock for opening-hours labels and event countdowns.
    const tick = () => setNowTimestamp(Date.now())
    const timeout = setTimeout(tick, 0)
    const interval = setInterval(tick, 60000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // Rotate hero slides on a timer unless reduced-motion is enabled.
    if (reduceMotion || heroSlides.length < 2) return undefined
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5500)
    return () => clearInterval(interval)
  }, [reduceMotion])

  useEffect(() => {
    // Initial menu fetch + periodic refresh so admin updates appear without reload.
    let mounted = true
    const loadMenu = async (showLoading = false) => {
      if (showLoading) setMenuLoading(true)
      try {
        const menu = await fetchMenuItems()
        if (!mounted) return
        setMenuItems(menu)
        setMenuError('')
      } catch {
        if (!mounted) return
        setMenuError('Unable to load menu.')
      } finally {
        if (mounted && showLoading) setMenuLoading(false)
      }
    }

    loadMenu(true)
    const refreshInterval = setInterval(() => {
      loadMenu(false)
    }, 20000)
    const onFocus = () => loadMenu(false)
    window.addEventListener('focus', onFocus)

    return () => {
      mounted = false
      clearInterval(refreshInterval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    // Poll events periodically so newly published events appear without reload.
    let mounted = true
    const loadEvents = async () => {
      try {
        const events = await fetchEvents()
        if (!mounted) return
        if (Array.isArray(events)) setEventsData(events)
      } catch {
        if (!mounted) return
        setEventsData(defaultExclusiveEvents)
      }
    }
    loadEvents()
    const interval = setInterval(loadEvents, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const date = formState.date
    const guests = Number(formState.guests || 2)
    if (!date || !Number.isFinite(guests) || guests <= 0) {
      setAvailabilitySlots([])
      setAvailabilityMessage('')
      return
    }

    let mounted = true
    setAvailabilityLoading(true)
    setAvailabilityMessage('')
    ;(async () => {
      try {
        const availability = await fetchReservationAvailability(date, guests)
        if (!mounted) return
        const slots = Array.isArray(availability?.slots) ? availability.slots : []
        setAvailabilitySlots(slots)
        if (slots.length && !slots.some((slot) => slot.time === formState.time && slot.available)) {
          setFormState((prev) => ({ ...prev, time: '' }))
        }
        setAvailabilityMessage(
          slots.some((slot) => slot.available)
            ? 'Live slots updated.'
            : 'No online slots remain for this date. Try another day.',
        )
      } catch {
        if (!mounted) return
        setAvailabilitySlots([])
        setAvailabilityMessage('Unable to fetch live availability right now.')
      } finally {
        if (mounted) setAvailabilityLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [formState.date, formState.guests])

  useEffect(() => {
    // Basic focus trap for the dish modal for keyboard users.
    if (!selectedDish) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeDishModal()
      if (event.key !== 'Tab' || !modalRef.current) return
      const nodes = modalRef.current.querySelectorAll('button, [href], input, select, textarea')
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    modalRef.current?.querySelector('button')?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedDish])

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'Gluten-Free') {
      return menuItems.filter((item) =>
        Array.isArray(item.dietary)
          ? item.dietary.map((tag) => String(tag).toLowerCase()).includes('gluten-free')
          : false,
      )
    }
    if (activeCategory === 'Nut-Free') {
      return menuItems.filter((item) =>
        Array.isArray(item.dietary)
          ? item.dietary.map((tag) => String(tag).toLowerCase()).includes('nut-free')
          : false,
      )
    }
    if (activeCategory === 'Drink Categories') {
      return menuItems.filter((item) => item.category === 'Drinks')
    }
    return menuItems.filter((item) => {
      const categoryPass = item.category === activeCategory
      return categoryPass
    })
  }, [activeCategory, menuItems])
  const featuredMenu = useMemo(() => {
    // Bring craving matches to the top, then cap visible cards.
    // Cravings intentionally search across all categories.
    const baseList = activeCraving
      ? menuItems.filter((item) => matchesCraving(item, activeCraving))
      : filteredMenu
    const prioritized = [...baseList].sort((a, b) => {
      const aMatch = matchesCraving(a, activeCraving) ? 1 : 0
      const bMatch = matchesCraving(b, activeCraving) ? 1 : 0
      return bMatch - aMatch
    })
    return prioritized.slice(0, 6)
  }, [filteredMenu, activeCraving, menuItems])
  const recommendedMenu = useMemo(() => {
    const source = activeCraving ? menuItems.filter((item) => matchesCraving(item, activeCraving)) : menuItems
    return source.filter((item) => item.available !== false).slice(0, 6)
  }, [activeCraving, menuItems])
  const liveHours = useMemo(() => getLiveHoursStatus(nowTimestamp || 0), [nowTimestamp])
  const availableTimeOptions = useMemo(
    () => availabilitySlots.filter((slot) => slot.available),
    [availabilitySlots],
  )
  const estimatedDeposit = useMemo(() => {
    if (!formState.depositOptIn) return 0
    const guests = Number(formState.guests || 0)
    return Number.isFinite(guests) && guests > 0 ? guests * 15000 : 0
  }, [formState.depositOptIn, formState.guests])

  const openDishModal = (dish, fromFullMenu = false) => {
    // fromFullMenu controls whether the modal shows a back action.
    setReturnToFullMenu(fromFullMenu)
    setSelectedDish(dish)
  }

  const closeDishModal = () => {
    setSelectedDish(null)
    setReturnToFullMenu(false)
  }

  const backToFullMenuFromDish = () => {
    // Return users to the full menu overlay after viewing one dish.
    setSelectedDish(null)
    setIsFullMenuOpen(true)
    setReturnToFullMenu(false)
  }

  const appendRequest = (text) => {
    setFormState((prev) => {
      if (prev.requests.includes(text)) return prev
      return { ...prev, requests: prev.requests ? `${prev.requests}; ${text}` : text }
    })
  }

  const handleDishPreference = (name) => {
    appendRequest(`Preference: ${name}`)
    closeDishModal()
    trackEvent('dish_preference_added', { name })
    reserveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleQuickReserveInput = (event) => {
    const { name, value } = event.target
    setQuickReserve((prev) => ({ ...prev, [name]: value }))
  }

  const openDatePicker = (inputRef) => {
    const node = inputRef?.current
    if (!node) return
    if (typeof node.showPicker === 'function') {
      node.showPicker()
      return
    }
    node.focus()
  }

  const handleQuickReserveSubmit = (event) => {
    event.preventDefault()
    setFormState((prev) => ({
      ...prev,
      date: quickReserve.date || prev.date,
      time: quickReserve.time || prev.time,
      guests: quickReserve.guests || prev.guests,
    }))
    trackEvent('reservation_funnel_started', {
      date: quickReserve.date || null,
      time: quickReserve.time || null,
      guests: quickReserve.guests || null,
    })
    setIsReserveModalOpen(false)
    reserveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleInput = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    if (name === 'date') setAvailabilityMessage('Checking live slot availability...')
    if (name === 'time') trackEvent('reservation_slot_selected', { time: nextValue })
    setFormState((prev) => ({ ...prev, [name]: nextValue }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    trackEvent('reservation_submit_attempt', {
      date: formState.date,
      time: formState.time,
      guests: formState.guests,
      depositOptIn: formState.depositOptIn,
    })
    const errors = validateReservation(formState)
    setFormErrors(errors)
    if (Object.keys(errors).length) {
      setSubmitState('error')
      setSubmitMessage('Please fix highlighted fields.')
      trackEvent('reservation_submit_invalid', { errors: Object.keys(errors) })
      return
    }
    setSubmitState('submitting')
    try {
      const res = await submitReservation(formState)
      setSubmitState('success')
      setSubmitMessage(`Reservation confirmed: ${res.confirmationId}`)
      const params = new URLSearchParams({
        confirmationId: res.confirmationId,
        email: formState.email,
      })
      const manageUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}#reserve`
      setManageReservationUrl(manageUrl)
      setFormState(reservationDefaults)
      setQuickReserve({ date: '', time: '', guests: '2' })
      setAvailabilitySlots([])
      setAvailabilityMessage('')
      trackEvent('reservation_submitted', {
        guests: formState.guests,
        depositOptIn: formState.depositOptIn,
      })
    } catch {
      setSubmitState('error')
      setSubmitMessage('Reservation failed. Try again.')
      trackEvent('reservation_submit_failed')
    }
  }

  const handleCancelInput = (event) => {
    const { name, value } = event.target
    setCancelForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancelReservation = async (event) => {
    event.preventDefault()
    setCancelState('submitting')
    try {
      await cancelReservation(cancelForm)
      setCancelState('success')
      setCancelMessage(`Reservation ${cancelForm.confirmationId} cancelled successfully.`)
      setCancelForm({ confirmationId: '', email: '' })
      trackEvent('reservation_cancelled', { confirmationId: cancelForm.confirmationId })
    } catch {
      setCancelState('error')
      setCancelMessage('Unable to cancel reservation. Check ID and email.')
      trackEvent('reservation_cancel_failed')
    }
  }

  return (
    <div className="relative overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ivory focus:px-3 focus:py-2 focus:text-charcoal">
        Skip to content
      </a>

      <motion.div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-charcoal" initial={{ opacity: 1 }} animate={{ opacity: loading ? 1 : 0 }} transition={{ duration: 0.6 }}>
        <div className="text-center">
          <p className="font-serif text-5xl text-ivory">Atelier Noir</p>
          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-gold/80">The Art of Fine Dining</p>
        </div>
      </motion.div>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-charcoal/40 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <a href="#hero" className="font-serif text-2xl text-ivory">Atelier Noir</a>
          <div className="hidden items-center gap-8 md:flex">
            {['Story', 'Timeline', 'Experiences', 'Menu', 'Gallery', 'Reserve', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="lux-link">
                {item}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <LuxButton onClick={() => setIsReserveModalOpen(true)}>Reserve</LuxButton>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <a href="#menu" className="rounded-md border border-gold/35 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-gold">
              Menu
            </a>
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(true)}
              className="rounded-md border border-gold/35 bg-gold/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-gold"
            >
              Reserve
            </button>
          </div>
        </nav>
      </header>

      <main id="main-content" className="pb-24">
        <section id="hero" className="relative flex min-h-screen items-center px-6 pt-28">
          <motion.div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeHeroSlide.local}
                src={activeHeroSlide.local}
                alt={activeHeroSlide.alt}
                onError={(event) => withFallback(event, activeHeroSlide.fallback)}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </AnimatePresence>
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_24%,rgba(232,153,74,0.34),transparent_46%),linear-gradient(180deg,rgba(20,14,10,0.38),rgba(14,12,12,0.84))]" />
          <div className="relative mx-auto w-full max-w-7xl pb-20">
            <p className="mb-6 text-xs uppercase tracking-[0.28em] text-gold/90">Atelier Noir</p>
            <AnimatedText text="Where Fire, Flavor, and Craft Converge" className="max-w-4xl font-serif text-6xl leading-tight text-ivory md:text-8xl" />
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ivory/80">
              At Atelier Noir, every dish is carefully prepared to highlight bold flavors and seasonal ingredients. From the kitchen to your table, our team blends precision, skill, and attentive service to create a dining experience that is warm, intimate, and memorable.
            </p>
            <div className="mt-8">
              <LuxButton onClick={() => setIsReserveModalOpen(true)}>Reserve a Table</LuxButton>
            </div>
          </div>
        </section>

        <SectionWrapper id="story" className="mx-auto max-w-7xl px-6 py-28">
          <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-gradient-to-br from-[#190f0c]/95 via-[#140f12]/92 to-[#090909]/95 p-6 shadow-luxe md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_34%,rgba(220,151,69,0.2),transparent_46%),radial-gradient(circle_at_80%_68%,rgba(220,151,69,0.16),transparent_44%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(242,188,118,0.24)_1px,transparent_1px)] [background-size:3px_3px]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gold/90">Chef | 148</p>
                <h2 className="font-serif text-5xl text-ivory md:text-6xl">Chef Alexandre Beaumont</h2>
                <p className="max-w-xl text-base leading-relaxed text-ivory/80">
                  Formerly of Michelin-starred kitchens in Paris and Lyon, Chef Beaumont brings soulful, ingredient-driven
                  cooking inspired by the seasons and his French heritage.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <LuxButton onClick={() => setIsReserveModalOpen(true)}>Reserve a Table</LuxButton>
                  <button
                    type="button"
                    onClick={() => setIsFullMenuOpen(true)}
                    className="rounded-md border border-gold/45 bg-black/30 px-5 py-3 text-xs uppercase tracking-[0.2em] text-gold transition hover:border-gold/70 hover:bg-gold/10"
                  >
                    View Full Menu
                  </button>
                </div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-gold/75">Reservations recommended · menu changes with the seasons</p>
              </div>
              <div className="grid gap-3 md:grid-cols-[1.1fr,0.9fr]">
                <img
                  src={chefImages.primary.local}
                  onError={(event) => withFallback(event, chefImages.primary.fallback)}
                  alt="Chef portrait in white jacket"
                  className="h-[23rem] w-full rounded-2xl border border-white/10 object-cover shadow-luxe md:h-[27rem]"
                  loading="lazy"
                />
                <div className="grid gap-3">
                  <img
                    src={chefImages.secondary.local}
                    onError={(event) => withFallback(event, chefImages.secondary.fallback)}
                    alt="Flame cooking in a professional kitchen"
                    className="h-[11.1rem] w-full rounded-2xl border border-white/10 object-cover shadow-luxe md:h-[13rem]"
                    loading="lazy"
                  />
                  <img
                    src={chefImages.tertiary.local}
                    onError={(event) => withFallback(event, chefImages.tertiary.fallback)}
                    alt="Chef station with premium ingredients and bottles"
                    className="h-[11.1rem] w-full rounded-2xl border border-white/10 object-cover shadow-luxe md:h-[13rem]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="relative mt-10 border-t border-gold/20 pt-8 text-center">
              <p className="mx-auto max-w-3xl font-serif text-3xl text-ivory/92">
                &quot;Cooking is an art of capturing the essence of a fleeting moment, one that lingers on the palate.&quot;
              </p>
              <p className="mt-4 text-sm italic text-gold/75">Recognized by local and international guides, 2025</p>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper id="timeline" className="mx-auto max-w-7xl px-6 py-28">
          <motion.div
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-olive/55 via-espresso/70 to-charcoal p-8 md:p-12"
            initial={{ backgroundPosition: '0% 50%' }}
            whileInView={{ backgroundPosition: '100% 50%' }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 2.4, ease: 'easeInOut' }}
            style={{ backgroundSize: '180% 180%' }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-gold/90">From Farm to Plate</p>
            <h2 className="mt-3 font-serif text-5xl text-ivory">A Journey of Taste</h2>
            <div className="mt-4 max-w-3xl space-y-2">
              {farmToPlateIntro.map((line, index) => (
                <motion.p
                  key={line}
                  className="text-ivory/75"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.08 }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <div className="relative mt-12 space-y-12">
              <div className="pointer-events-none absolute left-4 top-2 hidden h-[92%] w-px bg-gradient-to-b from-gold/70 via-gold/30 to-transparent md:block" />
              {farmToPlateSteps.map((step, index) => (
                <motion.article
                  key={step.id}
                  className="grid gap-8 md:grid-cols-2 md:items-center"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`${index % 2 ? 'md:order-2' : ''} relative pl-0 md:pl-12`}>
                    <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/60 bg-black/40 text-xs font-semibold text-gold">
                      {index + 1}
                    </span>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold/90">{step.title}</p>
                    <h3 className="mt-2 font-serif text-4xl text-ivory">{step.heading}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-ivory/74 md:text-base">{step.body}</p>
                  </div>
                  <motion.div
                    className={`${index % 2 ? 'md:order-1' : ''} group relative overflow-hidden rounded-2xl border border-white/10 shadow-luxe`}
                    whileHover={reduceMotion ? undefined : { rotateY: 6, rotateX: -2, scale: 1.01 }}
                    transition={{ duration: 0.35 }}
                    style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
                  >
                    <img
                      src={step.image}
                      onError={(event) => withFallback(event, menuImageFallback)}
                      alt={`${step.title} step showing ingredient and kitchen craftsmanship`}
                      className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-3 bottom-3 rounded-md border border-gold/25 bg-black/55 px-3 py-2 text-xs text-ivory/86 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {step.note}
                    </div>
                  </motion.div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </SectionWrapper>

        <SectionWrapper id="menu" className="mx-auto max-w-7xl px-6 py-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-espresso/75 to-charcoal/70 p-8">
            <p className="text-center text-xs uppercase tracking-[0.24em] text-gold/90">Interactive Menu</p>
            <h2 className="mt-4 text-center font-serif text-5xl text-ivory">Seasonal Carte</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {menuCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category)
                    setActiveCraving('')
                  }}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${activeCategory === category ? 'border-gold/70 bg-gold/15 text-gold' : 'border-white/20 text-ivory/75 hover:border-gold/40 hover:text-gold'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {menuSpecialCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category)
                    setActiveCraving('')
                  }}
                  className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${activeCategory === category ? 'border-sky-300/70 bg-sky-300/10 text-sky-200' : 'border-white/20 text-ivory/75 hover:border-sky-300/40 hover:text-sky-200'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-gold/20 bg-black/25 p-4">
              <p className="text-center text-xs uppercase tracking-[0.22em] text-gold/90">
                What are you craving tonight?
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                {cravingOptions.map((craving) => (
                  <button
                    key={craving}
                    type="button"
                    onClick={() => setActiveCraving((prev) => (prev === craving ? '' : craving))}
                    className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                      activeCraving === craving
                        ? 'border-gold/70 bg-gold/15 text-gold'
                        : 'border-white/20 text-ivory/75 hover:border-gold/40 hover:text-gold'
                    }`}
                  >
                    {craving}
                  </button>
                ))}
              </div>
            </div>

            {menuLoading ? <p className="mt-10 text-center text-sm text-ivory/75">Loading menu...</p> : null}
            {menuError ? <p className="mt-10 text-center text-sm text-rose-300">{menuError}</p> : null}
            {!menuLoading && !menuError ? (
              <motion.div layout className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {featuredMenu.map((item) => (
                    (() => {
                      const recommended = matchesCraving(item, activeCraving)
                      const unavailable = item.available === false
                      return (
                    <motion.button
                      key={item.id}
                      type="button"
                      layout
                      onClick={() => openDishModal(item)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      whileHover={reduceMotion ? undefined : { scale: 1.015, rotateY: 10, rotateX: -4 }}
                      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                      className={`group overflow-hidden rounded-2xl border bg-black/30 text-left shadow-luxe ${
                        recommended && !unavailable ? 'animate-pulse-glow border-gold/60' : 'border-white/15'
                      }`}
                      style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img src={resolveImagePath(item.image)} onError={(event) => withFallback(event, menuImageFallback)} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <img
                          src={resolveImagePath(item.hoverImage || item.image)}
                          onError={(event) => withFallback(event, resolveImagePath(item.image || menuImageFallback))}
                          alt={`${item.name} alternate presentation`}
                          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                      </div>
                      <div className="space-y-2 p-5">
                        <h3 className="font-serif text-3xl text-ivory">{item.name}</h3>
                        <p className="text-xs uppercase tracking-[0.24em] text-ivory/65">{item.category}</p>
                        <p className="inline-flex rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold/95">
                          Click to view
                        </p>
                        {unavailable ? (
                          <p className="text-[10px] uppercase tracking-[0.2em] text-rose-300">Unavailable</p>
                        ) : null}
                        {recommended && !unavailable ? <p className="text-[10px] uppercase tracking-[0.2em] text-gold/90">Recommended</p> : null}
                      </div>
                    </motion.button>
                      )
                    })()
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : null}
            {!menuLoading && !menuError ? (
              <div className="mt-10 flex justify-center">
                <LuxButton onClick={() => setIsFullMenuOpen(true)}>View All Menu</LuxButton>
              </div>
            ) : null}
            {!menuLoading && !menuError && activeCategory === 'Drink Categories' ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/90">Drink Categories</p>
                <div className="mt-3 space-y-3">
                  {Object.entries(drinkCategories).map(([group, names]) => (
                    <div key={group}>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gold/75">{group}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {names.map((name) => (
                          <span key={`${group}-${name}`} className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-ivory/80">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {!menuLoading && !menuError ? (
              <div className="mt-8 rounded-2xl border border-gold/25 bg-black/25 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/90">
                  {activeCraving ? `${activeCraving} Recommendations` : 'Chef Recommendations'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendedMenu.length ? (
                    recommendedMenu.map((item) => (
                      <button
                        key={`rec-${item.id}`}
                        type="button"
                        onClick={() => openDishModal(item)}
                        className="rounded-full border border-gold/35 px-3 py-1 text-[11px] text-gold/95 transition hover:border-gold/70"
                      >
                        {item.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-ivory/70">No recommendations available right now.</p>
                  )}
                </div>
              </div>
            ) : null}
            {!menuLoading && !menuError && !filteredMenu.length ? (
              <p className="mt-10 text-center text-sm text-ivory/75">No dishes match this dietary filter right now.</p>
            ) : null}
          </div>
        </SectionWrapper>

        <SectionWrapper id="experiences" className="mx-auto max-w-7xl px-6 py-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-espresso/75 via-charcoal to-olive/55 p-8 md:p-12">
            <p className="text-center text-xs uppercase tracking-[0.24em] text-gold/90">Exclusive Experiences</p>
            <h2 className="mt-4 text-center font-serif text-5xl text-ivory">Evenings Beyond Service</h2>
            {eventsData.length ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {eventsData.map((event, index) => {
                  const countdown = getCountdown(event.date, nowTimestamp)
                  return (
                    <motion.article
                      key={event.id || event.title}
                      className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-luxe"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={reduceMotion ? undefined : { y: -4 }}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/90">
                        {new Date(event.date).toLocaleString()}
                      </p>
                      <h3 className="mt-3 font-serif text-3xl text-ivory">{event.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ivory/75">
                        {event.summary || 'Curated multi-course evening with live culinary storytelling.'}
                      </p>
                      <div className="mt-5 rounded-lg border border-gold/20 bg-black/25 p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gold/85">Countdown</p>
                        {countdown ? (
                          <p className="mt-1 font-serif text-2xl text-ivory">
                            {countdown.days}d : {countdown.hours}h : {countdown.minutes}m
                          </p>
                        ) : (
                          <p className="mt-1 font-serif text-2xl text-ivory">Live Tonight</p>
                        )}
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-8 text-center">
                <p className="font-serif text-3xl text-ivory">No public events released yet.</p>
                <p className="mt-2 text-sm text-ivory/70">Upcoming experiences will appear here once published from admin.</p>
              </div>
            )}
            <div className="mt-10 flex justify-center">
              <LuxButton onClick={() => setIsReserveModalOpen(true)}>Private Dining</LuxButton>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper id="gallery" className="mx-auto max-w-7xl px-6 py-28">
          <p className="text-center text-xs uppercase tracking-[0.24em] text-gold/90">Gallery</p>
          <h2 className="mt-4 text-center font-serif text-4xl text-ivory md:text-5xl">Cuisine &amp; Atmosphere</h2>
          <p className="mx-auto mt-5 max-w-4xl text-center text-sm leading-relaxed text-ivory/78 md:text-base">
            At Atelier Noir, we focus on honest cooking and thoughtful details. Every dish is prepared with care,
            balancing flavor, texture, and season so that what arrives at your table feels intentional, not complicated.
          </p>
          <p className="mx-auto mt-4 max-w-4xl text-center text-sm leading-relaxed text-ivory/78 md:text-base">
            From the moment you walk in, the space is designed to feel warm and welcoming. Soft lighting, attentive
            service, and a relaxed pace allow you to settle in and enjoy the experience fully.
          </p>
          <p className="mx-auto mt-4 max-w-4xl text-center text-sm leading-relaxed text-ivory/78 md:text-base">
            It&apos;s not just about what&apos;s on the plate. It&apos;s about how the evening feels, comfortable,
            personal, and worth remembering.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.author} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm leading-relaxed text-ivory/82">&quot;{item.quote}&quot;</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-gold/90">{item.author}</p>
                <p className="mt-1 text-xs text-ivory/70">{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {galleryItems.map((item, index) => (
              <motion.div key={item.src} className="overflow-hidden rounded-2xl border border-white/10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.05 }}>
                <img src={item.src} onError={(event) => withFallback(event, item.fallback)} alt={item.alt} className="h-72 w-full object-cover transition-transform duration-700 hover:scale-[1.03]" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper id="closing" className="mx-auto max-w-7xl px-6 py-28">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <img
              src={closingImage.src}
              onError={(event) => withFallback(event, closingImage.fallback)}
              alt="Candlelit table prepared for evening service"
              className="h-[26rem] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
          </div>
          <div className="rounded-b-3xl border-x border-b border-white/10 bg-black/70 p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/85">Evening Experience</p>
            <p className="mt-2 font-serif text-4xl text-ivory md:text-5xl">Evenings linger here.</p>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ivory/90 md:text-base">
              As the dining room settles into candlelight, each course is served with care and at a thoughtful pace.
              Soft jazz, attentive service, and chef-led seasonal tasting create an evening meant for conversation,
              celebration, and memorable dining.
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gold/85">
              Signature tasting menus, private dining, and curated wine pairings are available
            </p>
            <div className="mt-6">
              <LuxButton onClick={() => setIsReserveModalOpen(true)}>Reserve a Table</LuxButton>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper id="reserve" className="mx-auto max-w-7xl px-6 py-28">
          <div ref={reserveRef} className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-black/45 via-espresso/45 to-charcoal/80 p-8 shadow-luxe md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,151,69,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(220,151,69,0.12),transparent_44%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gold/90">Reservation Atelier</p>
                <h2 className="mt-3 font-serif text-5xl text-ivory">Reserve Your Evening</h2>
                <p className="mt-3 text-sm text-ivory/75">Choose your date and seating time, then receive a confirmation ID you can use to manage your booking.</p>

                <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
                  <label className="rounded-xl border border-gold/25 bg-black/30 p-3">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-gold/80">Date</span>
                    <div className="flex items-center gap-2">
                      <input
                        ref={reserveDateInputRef}
                        name="date"
                        type="date"
                        value={formState.date}
                        onChange={handleInput}
                        aria-invalid={Boolean(formErrors.date)}
                        className="w-full rounded-md border border-white/20 bg-black/55 px-2 py-2 text-sm text-ivory outline-none focus:border-gold/55"
                      />
                      <button
                        type="button"
                        onClick={() => openDatePicker(reserveDateInputRef)}
                        className="rounded-md border border-gold/35 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-gold"
                      >
                        Pick
                      </button>
                    </div>
                    {formErrors.date ? <p className="mt-1 text-xs text-rose-300">{formErrors.date}</p> : null}
                  </label>
                  <label className="rounded-xl border border-gold/25 bg-black/30 p-3">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-gold/80">Time</span>
                    <select
                      name="time"
                      value={formState.time}
                      onChange={handleInput}
                      aria-invalid={Boolean(formErrors.time)}
                      className="w-full rounded-md border border-white/20 bg-black/55 px-2 py-2 text-sm text-ivory outline-none focus:border-gold/55"
                      disabled={!formState.date || availabilityLoading}
                    >
                      <option value="">
                        {availabilityLoading
                          ? 'Loading slots...'
                          : !formState.date
                            ? 'Pick a date first'
                            : availableTimeOptions.length
                              ? 'Select a time slot'
                              : 'No slots available'}
                      </option>
                      {availableTimeOptions.map((slot) => (
                        <option key={slot.time} value={slot.time} className="bg-black text-ivory">
                          {slot.time} ({slot.remaining} seats left)
                        </option>
                      ))}
                    </select>
                    {formErrors.time ? <p className="mt-1 text-xs text-rose-300">{formErrors.time}</p> : null}
                  </label>
                  <label className="rounded-xl border border-gold/25 bg-black/30 p-3">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-gold/80">Guests</span>
                    <select
                      name="guests"
                      value={formState.guests}
                      onChange={handleInput}
                      aria-invalid={Boolean(formErrors.guests)}
                      className="w-full rounded-md border border-white/20 bg-black/55 px-2 py-2 text-sm text-ivory outline-none focus:border-gold/55"
                    >
                      <option value="2" className="bg-black text-ivory">2 Guests</option>
                      <option value="4" className="bg-black text-ivory">4 Guests</option>
                      <option value="6" className="bg-black text-ivory">6 Guests</option>
                      <option value="8" className="bg-black text-ivory">8 Guests</option>
                    </select>
                    {formErrors.guests ? <p className="mt-1 text-xs text-rose-300">{formErrors.guests}</p> : null}
                  </label>
                  <label className="rounded-xl border border-gold/25 bg-black/30 p-3">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-gold/80">Email</span>
                    <input
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleInput}
                      aria-invalid={Boolean(formErrors.email)}
                      placeholder="Email for confirmation"
                      className="w-full rounded-md border border-white/20 bg-black/55 px-2 py-2 text-sm text-ivory placeholder:text-ivory/55 outline-none focus:border-gold/55"
                    />
                    {formErrors.email ? <p className="mt-1 text-xs text-rose-300">{formErrors.email}</p> : null}
                  </label>
                  <label className="rounded-xl border border-gold/25 bg-black/30 p-3 md:col-span-2">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-gold/80">Special Notes</span>
                    <textarea name="requests" value={formState.requests} onChange={handleInput} placeholder="Allergies, occasion, table preference" className="min-h-[90px] w-full resize-none bg-transparent text-sm text-ivory outline-none" />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gold/25 bg-black/30 p-3 md:col-span-2">
                    <input
                      name="depositOptIn"
                      type="checkbox"
                      checked={Boolean(formState.depositOptIn)}
                      onChange={handleInput}
                      className="h-4 w-4 accent-[#c9a46a]"
                    />
                    <span className="text-sm text-ivory/88">
                      Secure this slot with optional deposit
                      {estimatedDeposit > 0 ? ` (NGN ${estimatedDeposit.toLocaleString()})` : ''}.
                    </span>
                  </label>
                  <LuxButton className="md:col-span-2" disabled={submitState === 'submitting'}>
                    {submitState === 'submitting' ? 'Submitting...' : 'Confirm Reservation'}
                  </LuxButton>
                </form>
                {availabilityMessage ? <p className="mt-3 text-xs uppercase tracking-[0.14em] text-gold/80">{availabilityMessage}</p> : null}
                {submitMessage ? (
                  <p aria-live="polite" className={`mt-4 text-sm ${submitState === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {submitMessage}
                  </p>
                ) : null}
                {manageReservationUrl && submitState === 'success' ? (
                  <p className="mt-3 text-xs text-ivory/80">
                    Manage link:{' '}
                    <a href={manageReservationUrl} className="text-gold underline underline-offset-2">
                      {manageReservationUrl}
                    </a>
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold/85">Booking Support</p>
                  <p className="mt-2 text-sm text-ivory/75">Need to adjust plans? Cancel your reservation with your confirmation ID and booking email.</p>
                  <form className="mt-4 space-y-3" onSubmit={handleCancelReservation}>
                    <input
                      name="confirmationId"
                      value={cancelForm.confirmationId}
                      onChange={handleCancelInput}
                      placeholder="Confirmation ID (e.g. R-1234)"
                      className="w-full rounded-lg border border-gold/25 bg-black/35 px-3 py-2 text-sm text-ivory outline-none focus:border-gold/55"
                    />
                    <input
                      name="email"
                      type="email"
                      value={cancelForm.email}
                      onChange={handleCancelInput}
                      placeholder="Reservation email"
                      className="w-full rounded-lg border border-gold/25 bg-black/35 px-3 py-2 text-sm text-ivory outline-none focus:border-gold/55"
                    />
                    <button
                      type="submit"
                      disabled={cancelState === 'submitting'}
                      className="w-full rounded-lg border border-rose-400/70 bg-rose-500/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
                    >
                      {cancelState === 'submitting' ? 'Cancelling...' : 'Cancel Reservation'}
                    </button>
                  </form>
                  {cancelMessage ? <p className={`mt-3 text-sm ${cancelState === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>{cancelMessage}</p> : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold/85">Service Windows</p>
                  <p className="mt-2 text-sm text-ivory/75">Evening seating begins from 5:30 PM (WAT). Private dining windows depend on chef schedule.</p>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </main>

      <footer id="contact" className="border-t border-white/10 bg-charcoal/70 px-6 py-12 text-sm text-ivory/75">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <p className="font-serif text-3xl text-ivory">Atelier Noir</p>
            <p className="mt-2 text-ivory/65">Luxury dining with cinematic motion and editorial ambiance.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold/90">Location &amp; Contact</p>
            <p className="mt-3">17 Akin Adesola Street, Victoria Island, Lagos</p>
            <p>+234 901 234 5678</p>
            <p>reservations@ateliernoir.ng</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold/90">Hours</p>
            <p className="mt-3">Mon-Thu: 5:30 PM - 10:30 PM</p>
            <p>Fri: 5:30 PM - 11:30 PM</p>
            <p>Sat: 3:00 PM - 11:30 PM</p>
            <p>Sun: 3:00 PM - 10:00 PM</p>
            <p className={`mt-3 font-semibold ${liveHours.tone}`}>{liveHours.label} (WAT)</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold/90">Map</p>
            <iframe
              title="Atelier Noir location map"
              src="https://maps.google.com/maps?q=17%20Akin%20Adesola%20Street%2C%20Victoria%20Island%2C%20Lagos&z=15&output=embed"
              className="mt-3 h-36 w-full rounded-lg border border-white/10"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-charcoal/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 text-xs">
          <a
            href="tel:+2349012345678"
            className="rounded-md border border-gold/35 px-3 py-2 font-semibold uppercase tracking-[0.16em] text-gold transition hover:border-gold/60"
          >
            Call +234 901 234 5678
          </a>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=17+Akin+Adesola+Street+Victoria+Island+Lagos"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-gold/35 px-3 py-2 font-semibold uppercase tracking-[0.16em] text-gold transition hover:border-gold/60"
          >
            Directions
          </a>
          <span className={`font-semibold uppercase tracking-[0.16em] ${liveHours.tone}`}>
            {liveHours.label}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isReserveModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsReserveModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-xl rounded-2xl border border-gold/35 bg-charcoal p-6 shadow-luxe"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-gold/90">Priority Reservation</p>
              <h3 className="mt-2 font-serif text-4xl text-ivory">Reserve</h3>
              <p className="mt-2 text-sm text-ivory/75">Reservations recommended · menu changes with the seasons</p>
              <form className="mt-6 grid gap-3 md:grid-cols-4" onSubmit={handleQuickReserveSubmit}>
                <input
                  ref={quickDateInputRef}
                  name="date"
                  type="date"
                  value={quickReserve.date}
                  onChange={handleQuickReserveInput}
                  className="rounded-md border border-gold/25 bg-black/30 px-3 py-2 text-sm text-ivory"
                />
                <button
                  type="button"
                  onClick={() => openDatePicker(quickDateInputRef)}
                  className="rounded-md border border-gold/25 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.12em] text-gold"
                >
                  Pick date
                </button>
                <select
                  name="time"
                  value={quickReserve.time}
                  onChange={handleQuickReserveInput}
                  className="rounded-md border border-gold/25 bg-black/30 px-3 py-2 text-sm text-ivory"
                >
                  <option value="">Choose time</option>
                  {reservationTimeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <select
                  name="guests"
                  value={quickReserve.guests}
                  onChange={handleQuickReserveInput}
                  className="rounded-md border border-gold/25 bg-black/30 px-3 py-2 text-sm text-ivory"
                >
                  <option value="2">2 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6 Guests</option>
                  <option value="8">8 Guests</option>
                </select>
                <LuxButton className="md:col-span-4">Continue to Reservation</LuxButton>
              </form>
            </motion.div>
          </motion.div>
        ) : null}

        {isFullMenuOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullMenuOpen(false)}
          >
            <motion.div
              className="w-full max-w-5xl rounded-2xl border border-gold/35 bg-charcoal p-6 shadow-luxe"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-4xl text-ivory">Full Menu</h3>
                <button
                  type="button"
                  className="rounded-md border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ivory/75"
                  onClick={() => setIsFullMenuOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 grid max-h-[70vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      openDishModal(item, true)
                      setIsFullMenuOpen(false)
                    }}
                    className="overflow-hidden rounded-xl border border-white/10 bg-black/35 text-left"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                  >
                    <img
                      src={resolveImagePath(item.image)}
                      onError={(event) => withFallback(event, menuImageFallback)}
                      alt={`${item.name} plated presentation`}
                      className="h-40 w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="space-y-2 px-4 py-3">
                      <p className="font-serif text-2xl text-ivory">{item.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/85">{item.category}</p>
                      <p className="inline-flex rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold/95">
                        Click to view
                      </p>
                      {item.available === false ? (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-rose-300">Unavailable</p>
                      ) : null}
                      <p className="text-xs text-ivory/70">{item.notes}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {selectedDish ? (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDishModal} role="dialog" aria-modal="true">
            <motion.div ref={modalRef} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gold/35 bg-charcoal shadow-luxe" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} onClick={(event) => event.stopPropagation()}>
              <div className="grid md:grid-cols-2">
                <img src={resolveImagePath(selectedDish.image)} onError={(event) => withFallback(event, menuImageFallback)} alt={selectedDish.name} className="h-52 w-full object-cover md:h-full" />
                <div className="space-y-4 p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/90">{selectedDish.category}</p>
                  {selectedDish.available === false ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-300">Unavailable</p>
                  ) : null}
                  <h3 className="font-serif text-4xl text-ivory">{selectedDish.name}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-gold/85">Chef Notes</p>
                  <p className="text-sm leading-relaxed text-ivory/78">{selectedDish.notes}</p>
                  <p className="text-sm text-ivory/76">
                    <span className="text-gold/90">Ingredients:</span> {selectedDish.ingredients.join(', ')}
                  </p>
                  <p className="text-sm text-ivory/76">
                    <span className="text-gold/90">Allergens:</span> {selectedDish.allergens}
                  </p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold/85">Recommended Meals</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {buildDishSuggestions(selectedDish, menuItems).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openDishModal(item, returnToFullMenu)}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs text-ivory/80 transition hover:border-gold/55 hover:text-gold"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedDish.category !== 'Drinks' ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/85">Suggested Drinks</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {buildDrinkSuggestions(selectedDish, menuItems).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => openDishModal(item, returnToFullMenu)}
                            className="rounded-full border border-white/20 px-3 py-1 text-xs text-ivory/80 transition hover:border-gold/55 hover:text-gold"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <LuxButton onClick={() => handleDishPreference(selectedDish.name)}>Add To Reservation</LuxButton>
                    {returnToFullMenu ? (
                      <button
                        type="button"
                        className="rounded-md border border-gold/35 px-4 py-3 text-xs uppercase tracking-[0.2em] text-gold transition hover:border-gold/60"
                        onClick={backToFullMenuFromDish}
                      >
                        Back to Full Menu
                      </button>
                    ) : null}
                    <button type="button" className="rounded-md border border-white/25 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ivory/75 transition hover:border-gold/45 hover:text-gold" onClick={closeDishModal}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default App
