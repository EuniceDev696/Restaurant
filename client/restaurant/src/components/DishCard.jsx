import { motion } from 'framer-motion'

function DishCard({ dish, index }) {
  return (
    <motion.article
      className="group overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-b from-white/10 to-white/5 shadow-luxe"
      style={{ transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotateX: -2, rotateY: 4, scale: 1.01 }}
    >
      <div className="relative overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-gold">
          Signature
        </span>
      </div>
      <div className="space-y-3 p-6">
        <h3 className="font-serif text-3xl text-ivory">{dish.name}</h3>
        <p className="text-sm leading-relaxed text-ivory/72">{dish.description}</p>
        <p className="text-xs uppercase tracking-[0.24em] text-gold/90">{dish.meta}</p>
      </div>
    </motion.article>
  )
}

export default DishCard
