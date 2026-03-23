import { motion } from 'framer-motion'

const offsetBySide = {
  left: -40,
  right: 40,
  center: 0,
}

function SectionWrapper({ id, className = '', side = 'center', children }) {
  return (
    <motion.section
      id={id}
      className={className}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 900px' }}
      initial={{ opacity: 0, x: offsetBySide[side] ?? 0, y: 18 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

export default SectionWrapper
