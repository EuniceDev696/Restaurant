import { motion } from 'framer-motion'

function RevealStagger({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.14 },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export default RevealStagger
