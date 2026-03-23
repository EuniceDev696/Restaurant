import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

function ParallaxImage({ src, alt, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [30, -35])

  return (
    <div ref={ref} className={className}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className="h-full w-full rounded-2xl object-cover shadow-luxe"
        loading="lazy"
      />
    </div>
  )
}

export default ParallaxImage
