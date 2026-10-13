/** Country search with keyboard support. Arrow keys move, Enter opens, Esc clears. */
import { useEffect, useId, useRef, useState } from 'react'
import { searchCountries } from '../lib/data'
import Flag from './Flag'

export default function Search({ onPick, autoFocus = false, onDone, placeholder = 'Find a country', shortcut = false }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const listId = useId()
  const results = searchCountries(q)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // "/" focuses the header search on desktop
  useEffect(() => {
    if (!shortcut) return
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcut])

  const choose = (c) => {
    onPick(c.id)
    setQ('')
    setOpen(false)
    inputRef.current?.blur()
    onDone?.()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) choose(results[active]) }
    else if (e.key === 'Escape') { e.stopPropagation(); setQ(''); inputRef.current?.blur(); onDone?.() }
  }

  const showList = open && q.trim().length > 0

  return (
    <div className="relative w-full">
      <label className="flex h-14 items-center gap-3 rounded-2xl bg-white px-4 shadow-pop ring-2 ring-transparent transition focus-within:ring-sun dark:bg-night-card">
        <span aria-hidden className="text-xl">🔍</span>
        <span className="sr-only">{placeholder}</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value.slice(0, 40)); setActive(0); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent font-bold text-ink placeholder:text-ink-soft/70 focus:outline-none dark:text-white dark:placeholder:text-white/50"
        />
        {q && (
          <button type="button" aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={() => { setQ(''); inputRef.current?.focus() }} className="grid h-9 w-9 place-items-center rounded-xl text-ink-soft hover:bg-sky-mist dark:text-white/70 dark:hover:bg-night-line">✕</button>
        )}
      </label>

      {showList && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-16 z-40 max-h-[50vh] animate-fade overflow-y-auto rounded-3xl bg-white p-2 shadow-float dark:bg-night-card">
          {results.length === 0 ? (
            <li className="px-4 py-5 text-center">
              <span className="block text-3xl" aria-hidden>🧭</span>
              <span className="mt-2 block font-bold text-ink dark:text-white">No country called “{q.trim()}”</span>
              <span className="block text-sm text-ink-soft dark:text-white/70">Check the spelling, or try the first few letters.</span>
            </li>
          ) : (
            results.map((c, i) => (
              <li
                key={c.id}
                id={`${listId}-${c.id}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(c)}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-2xl px-3 ${i === active ? 'bg-sky-day dark:bg-night-line' : ''}`}
              >
                <Flag id={c.id} className="h-7 w-10 rounded" />
                <span className="font-bold text-ink dark:text-white">{c.name}</span>
                <span className="ml-auto text-sm text-ink-soft dark:text-white/60">{c.capital}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
