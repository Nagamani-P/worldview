/** Accessible modal: fades in, Esc and backdrop close, focus moves inside and returns after. */
import { useEffect, useRef } from 'react'

export default function Modal({ label, onClose, children, wide = false }) {
  const ref = useRef(null)
  // Keep the latest onClose without re-running the focus effect on every render
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.activeElement
    // Focus a field marked data-autofocus, otherwise the dialog
    const first = ref.current?.querySelector('[data-autofocus]')
    ;(first || ref.current)?.focus()
    const onKey = (e) => e.key === 'Escape' && closeRef.current?.()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-night-deep/50 p-0 backdrop-blur-sm md:items-center md:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative max-h-[92vh] w-full animate-rise overflow-y-auto rounded-t-blob bg-white shadow-float outline-none dark:bg-night-card md:rounded-blob ${wide ? 'md:max-w-3xl' : 'md:max-w-lg'}`}
      >
        {children}
      </div>
    </div>
  )
}
