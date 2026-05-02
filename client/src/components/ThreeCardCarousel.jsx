import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

export default function ThreeCardCarousel({ items = [], cardWidth: propCardWidth }) {
  const [pos, setPos] = useState(0)
  const count = items.length

  if (count === 0) return null

  const cardWidth = propCardWidth || 420
  const gap = 32
  const trackOffset = cardWidth + gap
  const transition = { type: 'spring', stiffness: 220, damping: 30 }

  const goPrev = () => setPos(p => (p - 1 + count) % count)
  const goNext = () => setPos(p => (p + 1) % count)

  const trackWidth = useMemo(() => count * cardWidth + Math.max(0, count - 1) * gap, [count, cardWidth, gap])
  const viewportWidth = cardWidth * 3 + gap * 2

  return (
    <div className="w-full flex flex-col items-center">
  <div className="relative w-full max-w-[1300px] h-80 flex items-center justify-center">
        <div className="relative overflow-hidden" style={{ width: `${viewportWidth}px` }}>
          <motion.div
            className="flex"
            style={{ width: `${trackWidth}px`, gap: `${gap}px` }}
            animate={{ x: -(pos * trackOffset) }}
            transition={transition}
          >
            {items.map((item, idx) => (
              <div key={`${item.title}-${idx}`} style={{ width: `${cardWidth}px` }}>
                <article data-reveal="features" className="card-glow rounded-2xl p-7 h-72 flex flex-col justify-between text-white bg-[#0f0f14]">
                  <div className="text-5xl">{item.icon}</div>
                  <div>
                    <h4 className="text-2xl font-bold">{item.title}</h4>
                    <p className="mt-3 text-sm text-white/85">{item.body}</p>
                  </div>
                </article>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Prev/Next controls */}
        <button aria-label="Previous" onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
          ‹
        </button>
        <button aria-label="Next" onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
          ›
        </button>

      </div>

      {/* Pagination dots */}
      <div className="mt-4 flex items-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <button key={i} onClick={() => setPos(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2.5 w-2.5 rounded-full ${i === pos ? 'bg-white' : 'bg-white/30'} focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70`} />
        ))}
      </div>
    </div>
  )
}
