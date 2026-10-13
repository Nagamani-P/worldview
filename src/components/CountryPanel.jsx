/**
 * Country details. Floating card on the right (tablet/desktop),
 * bottom sheet on mobile (swipe the handle down to close).
 * Order is built for a 7-year-old: picture first, one fun fact, then four simple facts.
 */
import { useEffect, useRef } from 'react'
import { BY_ID, CONTINENTS } from '../lib/data'
import { peopleText, peopleHint, sizeLevel, SIZE_WORDS, listText, distanceText, flightText } from '../lib/format'
import { distanceKm } from '../lib/geoLookup'
import { useSpeech } from '../hooks/useSpeech'
import Flag from './Flag'
import PhotoTile from './PhotoTile'
import Sheet from './Sheet'

function Fact({ icon, label, value, hint }) {
  return (
    <div className="rounded-3xl bg-sky-mist p-4 dark:bg-night-deep/60">
      <div className="flex items-center gap-2 text-sm font-bold text-ink-soft dark:text-white/60">
        <span aria-hidden className="text-xl">{icon}</span>
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-extrabold leading-snug text-ink dark:text-white">{value}</div>
      {hint && <div className="mt-1 text-sm text-ink-soft dark:text-white/70">{hint}</div>}
    </div>
  )
}

export default function CountryPanel({ id, stamped, onStamp, onClose, onPick, homeId, onMakeHome }) {
  const c = BY_ID[id]
  const cont = CONTINENTS[c.continent]
  const { supported, speaking, speak, stop } = useSpeech()
  const scrollRef = useRef(null)

  useEffect(() => {
    stop()
    scrollRef.current?.scrollTo({ top: 0 })
  }, [id, stop])

  const level = sizeLevel(c.area)
  const home = homeId && BY_ID[homeId]
  const km = home && home.id !== c.id ? distanceKm(home.id, c.id) : null
  const script =
    `${c.name}. ${c.name} is in ${c.continent}. The capital city is ${c.capital}. ` +
    `${peopleText(c.pop)} people live here. They speak ${listText(c.languages)}. ` +
    `To say hello, you can say ${c.hello}. Did you know? ${c.fact} ` +
    `A famous animal here is the ${c.animal}. A yummy food is ${c.food}.` +
    (km ? ` It is ${distanceText(km).toLowerCase()} from ${home.name}.` : home?.id === c.id ? ' This is your home!' : '')

  const neighbours = c.borders.map((a3) => Object.values(BY_ID).find((x) => x.a3 === a3)).filter(Boolean)

  return (
    <Sheet label={`About ${c.name}`} onClose={onClose} accent={cont.color}>
      <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain px-5 pb-8 pt-2 md:px-6">
        {/* Hero */}
        <div className="flex items-start gap-4 pt-2">
          <Flag id={c.id} title={c.name} className="h-16 w-24 shrink-0 rounded-xl shadow-pop ring-1 ring-ink/15 dark:ring-white/20" />
          <div className="min-w-0 pr-12">
            <h2 className="font-display text-xl font-black leading-tight text-ink dark:text-white md:text-2xl">{c.name}</h2>
            <span
              className="mt-2 inline-block rounded-full px-3 py-0.5 text-sm font-extrabold text-ink"
              style={{ background: cont.color }}
            >
              {c.continent}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-3">
          {supported && (
            <button
              onClick={() => (speaking ? stop() : speak(script))}
              aria-pressed={speaking}
              className="flex h-12 items-center gap-2 rounded-2xl bg-ink px-5 font-display text-base font-extrabold text-white shadow-pop transition hover:scale-[1.03] hover:bg-ink-soft dark:bg-white dark:text-ink dark:hover:bg-sky-day"
            >
              <span aria-hidden>{speaking ? '⏹️' : '🔊'}</span>
              {speaking ? 'Stop' : 'Read to me'}
            </button>
          )}
          <button
            onClick={() => supported && speak(c.hello)}
            className="flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-display text-base font-extrabold text-ink shadow-pop ring-2 ring-ink/10 transition hover:scale-[1.03] hover:bg-sky-day dark:bg-night-card dark:text-white dark:ring-night-line dark:hover:bg-night-line"
          >
            <span aria-hidden>👋</span> Say “{c.hello}”
          </button>
        </div>

        {/* Fun fact */}
        <section aria-label="Fun fact" className="mt-6 rounded-3xl p-5 text-ink" style={{ background: cont.light }}>
          <p className="font-display text-base font-extrabold">Did you know?</p>
          <p className="mt-1 text-lg font-bold leading-snug">{c.fact}</p>
        </section>

        {/* From home */}
        {home && (
          <section aria-label="From home" className="mt-4 flex items-center gap-3 rounded-3xl bg-ink p-4 text-white dark:bg-night-deep">
            <span aria-hidden className="text-3xl">{km ? '✈️' : '🏠'}</span>
            {km ? (
              <div>
                <p className="text-sm font-bold text-white/70">From {home.name}</p>
                <p className="font-display text-lg font-extrabold leading-snug">{distanceText(km)}</p>
                <p className="text-sm font-bold text-sun">{flightText(km)}</p>
              </div>
            ) : (
              <p className="font-display text-lg font-extrabold">This is your home!</p>
            )}
          </section>
        )}

        {/* Four simple facts */}
        <section aria-label="Quick facts" className="mt-4 grid grid-cols-2 gap-3">
          <Fact icon="🏙️" label="Capital city" value={c.capital} />
          <Fact icon="🧑‍🤝‍🧑" label="People" value={peopleText(c.pop)} hint={peopleHint(c.pop)} />
          <Fact icon="💬" label={c.languages.length > 1 ? 'Languages' : 'Language'} value={listText(c.languages)} />
          <Fact icon="💰" label="Money" value={c.currency || 'Not sure'} />
        </section>

        {/* Size meter */}
        <section aria-label="How big" className="mt-3 rounded-3xl bg-sky-mist p-4 dark:bg-night-deep/60">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-ink-soft dark:text-white/60">
              <span aria-hidden className="text-xl">📏</span> How big?
            </span>
            <span className="font-display text-lg font-extrabold text-ink dark:text-white">{SIZE_WORDS[level]}</span>
          </div>
          <div className="mt-3 flex gap-1.5" role="meter" aria-valuemin={1} aria-valuemax={5} aria-valuenow={level} aria-label={`Size: ${SIZE_WORDS[level]}`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="h-3 flex-1 rounded-full" style={{ background: n <= level ? cont.color : 'rgba(127,140,170,0.25)' }} />
            ))}
          </div>
          <p className="mt-2 text-sm text-ink-soft dark:text-white/70">
            {c.area < 1 ? 'Less than 1' : c.area.toLocaleString('en')} square km{c.landlocked ? '. No sea around it!' : ''}
          </p>
        </section>

        {/* Animal + food */}
        <section aria-label="Animal and food" className="mt-4 grid grid-cols-2 gap-3">
          <PhotoTile label="Famous animal" name={c.animal} emoji={c.animalEmoji} tint={cont.light} />
          <PhotoTile label="Yummy food" name={c.food} emoji={c.foodEmoji} tint={cont.light} />
        </section>

        {/* Neighbours: invites the next tap */}
        {neighbours.length > 0 && (
          <section aria-label="Neighbours" className="mt-5">
            <h3 className="font-display text-base font-extrabold text-ink dark:text-white">Next door</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {neighbours.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onPick(n.id)}
                  className="flex h-12 items-center gap-2 rounded-2xl bg-white pl-2 pr-4 font-bold text-ink shadow-pop transition hover:scale-[1.03] hover:bg-sky-day dark:bg-night-card dark:text-white dark:hover:bg-night-line"
                >
                  <Flag id={n.id} className="h-6 w-9 rounded" /> {n.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {!home && onMakeHome && (
          <button onClick={() => onMakeHome(c.id)} className="mt-5 flex h-12 items-center gap-2 rounded-2xl px-2 font-bold text-ink-soft underline-offset-4 hover:underline dark:text-white/70">
            <span aria-hidden>🏠</span> I live here
          </button>
        )}

        {/* Passport stamp */}
        <div className="sticky bottom-0 -mx-5 mt-6 bg-gradient-to-t from-white via-white to-white/0 px-5 pb-1 pt-6 dark:from-night-card dark:via-night-card dark:to-night-card/0 md:-mx-6 md:px-6">
          {stamped ? (
            <div className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-namerica/20 font-display text-base font-extrabold text-ink dark:text-white">
              <span aria-hidden>✅</span> Stamped in your passport
            </div>
          ) : (
            <button
              onClick={() => onStamp(c.id)}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sun font-display text-lg font-black text-ink shadow-pop transition hover:scale-[1.02] hover:bg-sun-dark active:translate-y-0.5"
            >
              <span aria-hidden>🛂</span> Stamp my passport
            </button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
