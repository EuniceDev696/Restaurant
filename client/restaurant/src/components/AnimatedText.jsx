import { motion, useReducedMotion } from 'framer-motion'

function AnimatedText({ text, className = '' }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <h1 className={className}>{text}</h1>
  }

  return (
    <h1 className={className} aria-label={text}>
      {text.split('').map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className="inline-block"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.58,
            delay: 0.04 * index,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </h1>
  )
}

export default AnimatedText
