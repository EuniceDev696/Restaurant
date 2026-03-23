export function trackEvent(name, payload = {}) {
  if (import.meta.env.DEV) {
    // Keep tracking API minimal for easy backend analytics integration.
    console.info('[analytics]', name, payload)
  }
}
