function LuxButton({ as = 'button', href, className = '', children, ...rest }) {
  const baseClass =
    'inline-flex items-center justify-center rounded-md border border-gold/45 bg-gradient-to-r from-gold/85 to-[#d8bc86] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-charcoal transition-all duration-300 hover:scale-[1.03] hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60'

  if (as === 'a') {
    return (
      <a href={href} className={`${baseClass} ${className}`} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button className={`${baseClass} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export default LuxButton
