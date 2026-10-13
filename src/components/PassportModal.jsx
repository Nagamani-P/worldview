/** The explorer's passport: stamps grouped by continent. Tap a stamp to revisit. */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { COUNTRIES, CONTINENTS, BY_ID } from '../lib/data'
import Modal from './Modal'
import Flag from './Flag'
import HomePicker from './HomePicker'

const TOTAL = COUNTRIES.length
const PER_CONTINENT = COUNTRIES.reduce((m, c) => ((m[c.continent] = (m[c.continent] || 0) + 1), m), {})

function rank(n) {
  if (n >= 150) return 'World champion explorer'
  if (n >= 75) return 'Globe trotter'
  if (n >= 30) return 'Super traveller'
  if (n >= 10) return 'Junior explorer'
  if (n >= 1) return 'New traveller'
  return 'Ready to go'
}

export default function PassportModal({ onPick }) {
  const { state, dispatch } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)
  const close = () => dispatch({ type: 'passport', open: false })
  const ids = Object.keys(state.stamps).sort((a, b) => state.stamps[b].localeCompare(state.stamps[a]))
  const n = ids.length

  const grouped = Object.keys(CONTINENTS).map((cont) => ({
    cont,
    ids: ids.filter((id) => BY_ID[id]?.continent === cont),
  }))

  return (
    <Modal label="My passport" onClose={close} wide>
      {/* Cover */}
      <div className="relative bg-ink px-6 pb-6 pt-6 text-white dark:bg-night-deep md:px-8">
        <button onClick={close} aria-label="Close passport" className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-xl font-black transition hover:bg-sun hover:text-ink">✕</button>
        <p className="font-display text-sm font-extrabold text-sun">World View passport</p>
        <label className="mt-1 block">
          <span className="sr-only">Explorer name</span>
          <input
            value={state.explorerName}
            onChange={(e) => dispatch({ type: 'setName', name: e.target.value.replace(/[^\p{L} .'-]/gu, '').slice(0, 20) })}
            placeholder="Add your name"
            className="w-full max-w-[80%] rounded-xl bg-transparent font-display text-2xl font-black text-white placeholder:text-white/40 focus:bg-white/10 focus:outline-none"
          />
        </label>
        <p className="mt-1 font-bold text-white/80">{rank(n)}{state.starsTotal > 0 && ` · ⭐ ${state.starsTotal} stars`}</p>
        <div className="mt-3 max-w-sm"><HomePicker tone="dark" /></div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={n} aria-label="Countries stamped">
            <div className="h-full rounded-full bg-sun transition-all duration-700" style={{ width: `${(n / TOTAL) * 100}%` }} />
          </div>
          <span className="font-display font-extrabold">{n} of {TOTAL}</span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {n === 0 ? (
          <div className="rounded-3xl border-4 border-dashed border-ink/15 p-8 text-center dark:border-night-line">
            <div className="text-5xl" aria-hidden>🛂</div>
            <p className="mt-3 font-display text-lg font-extrabold text-ink dark:text-white">No stamps yet</p>
            <p className="mt-1 text-ink-soft dark:text-white/70">Tap any country on the globe, then press “Stamp my passport”.</p>
            <button onClick={close} className="mt-5 h-12 rounded-2xl bg-sun px-6 font-display font-black text-ink shadow-pop transition hover:scale-105 hover:bg-sun-dark">Go exploring</button>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ cont, ids }) => (
              <section key={cont} aria-label={cont}>
                <div className="flex items-baseline justify-between">
                  <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink dark:text-white">
                    <span className="h-4 w-4 rounded-full" style={{ background: CONTINENTS[cont].color }} aria-hidden />{cont}
                  </h3>
                  <span className="text-sm font-bold text-ink-soft dark:text-white/60">{ids.length} of {PER_CONTINENT[cont]}</span>
                </div>
                {ids.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-soft dark:text-white/60">No stamps here yet.</p>
                ) : (
                  <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {ids.map((id) => (
                      <li key={id}>
                        <button
                          onClick={() => { close(); onPick(id) }}
                          className={`group flex w-full flex-col items-center rounded-3xl border-4 border-double p-2 text-center transition hover:scale-105 ${state.lastStamp === id ? 'animate-stamp' : '-rotate-6'}`}
                          style={{ borderColor: CONTINENTS[cont].color }}
                          aria-label={`${BY_ID[id].name}, stamped on ${state.stamps[id]}`}
                        >
                          <Flag id={id} className="h-8 w-12 rounded" />
                          <span className="mt-1 line-clamp-2 text-sm font-extrabold leading-tight text-ink dark:text-white">{BY_ID[id].name}</span>
                          <span className="text-xs font-bold text-ink-soft dark:text-white/60">{state.stamps[id]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <div className="border-t-2 border-ink/10 pt-4 text-right dark:border-night-line">
              {confirmReset ? (
                <span className="inline-flex flex-wrap items-center justify-end gap-2">
                  <span className="font-bold text-ink dark:text-white">Remove all stamps?</span>
                  <button onClick={() => { dispatch({ type: 'resetPassport' }); setConfirmReset(false) }} className="h-11 rounded-xl bg-asia px-4 font-bold text-white hover:opacity-90">Yes, remove</button>
                  <button onClick={() => setConfirmReset(false)} className="h-11 rounded-xl bg-sky-mist px-4 font-bold text-ink hover:bg-sky-day dark:bg-night-deep dark:text-white">Keep them</button>
                </span>
              ) : (
                <button onClick={() => setConfirmReset(true)} className="text-sm font-bold text-ink-soft underline underline-offset-4 hover:text-ink dark:text-white/60 dark:hover:text-white">Start a new passport</button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
