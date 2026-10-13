/**
 * Panel shell. Desktop/tablet: floating card on the right.
 * Mobile: bottom sheet. Drag the handle down to close. Esc closes too.
 */
import { useEffect, useRef, useState } from 'react'

export default function Sheet({ label, onClose, accent, children }) {
  const ref = useRef(null)
  const startY = useRef(null)
  const [drag, setDrag] = useState(0)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const onKey = (e) => {
      // Esc closes the panel, unless the child is typing in the search box
      if (e.key === 'Escape' && document.activeElement?.tagName !== 'INPUT') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    ref.current?.focus({ preventScroll: true }) // keyboard users land in the panel
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onTouchStart = (e) => (startY.current = e.touches[0].clientY)
  const onTouchMove = (e) => {
    if (startY.current == null) return
    setDrag(Math.max(0, e.touches[0].clientY - startY.current))
  }
  const onTouchEnd = () => {
    if (drag > 90) onClose()
    setDrag(0)
    startY.current = null
  }

  return (
    <aside
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label={label}
      style={{ transform: drag ? `translateY(${drag}px)` : undefined, borderTopColor: accent }}
      className="fixed inset-x-0 bottom-0 z-30 flex h-[64vh] animate-rise flex-col rounded-t-blob border-t-8 bg-white shadow-float outline-none dark:bg-night-card
                 md:inset-x-auto md:bottom-4 md:right-4 md:top-24 md:h-auto md:w-[420px] md:animate-slideIn md:rounded-blob md:border-t-8"
    >
      {/* Drag handle (mobile) */}
      <div
        className="flex shrink-0 justify-center pb-1 pt-3 md:hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <span className="h-1.5 w-14 rounded-full bg-ink/20 dark:bg-white/30" />
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-2xl bg-sky-mist text-xl font-black text-ink transition hover:scale-105 hover:bg-sun dark:bg-night-deep dark:text-white dark:hover:bg-sun dark:hover:text-ink"
      >
        ✕
      </button>
      <div className="relative min-h-0 flex-1">
        {/* soft top edge so scrolled content fades under the close button */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[5] hidden h-6 rounded-t-blob bg-gradient-to-b from-white to-white/0 dark:from-night-card dark:to-night-card/0 md:block" />
        {children}
      </div>
    </aside>
  )
}
