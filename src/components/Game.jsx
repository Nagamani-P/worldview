/**
 * "Find it!" game UI.
 *  GameSetup - pick a level
 *  GameHUD   - the question card while playing (read aloud, hints, next)
 *  GameDone  - stars for the game, play again
 * Taps on the globe/map are routed to the game by App while a game is on.
 */
import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { BY_ID } from '../lib/data'
import { LEVELS, ROUNDS, pickRounds, poolSize, hintFor, cheer } from '../lib/game'
import { useSpeech } from '../hooks/useSpeech'
import Modal from './Modal'
import Flag from './Flag'

function Stars({ n, size = 'text-2xl', of = 3 }) {
  return (
    <span className={`inline-flex gap-0.5 ${size}`} aria-label={`${n} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} aria-hidden className={i < n ? '' : 'opacity-25 grayscale'}>⭐</span>
      ))}
    </span>
  )
}

export function GameSetup() {
  const { state, dispatch } = useApp()
  const start = (level) => dispatch({ type: 'gameStart', level, rounds: pickRounds(level, state.lastRounds) })
  return (
    <Modal label="Find it! game" onClose={() => dispatch({ type: 'gameQuit' })}>
      <div className="p-6 md:p-7">
        <div className="text-5xl leading-none" aria-hidden>🎯</div>
        <h2 className="mt-3 font-display text-2xl font-black text-ink dark:text-white">Find it!</h2>
        <p className="mt-2 text-lg text-ink-soft dark:text-white/80">I'll name a country. Can you find it on the globe? You get {ROUNDS} countries.</p>
        <div className="mt-5 grid gap-3">
          {Object.entries(LEVELS).map(([key, l]) => (
            <button
              key={key}
              onClick={() => start(key)}
              className="flex min-h-[4.5rem] items-center gap-4 rounded-3xl bg-sky-mist px-4 text-left shadow-pop transition hover:scale-[1.02] hover:bg-sky-day dark:bg-night-deep/70 dark:hover:bg-night-line"
            >
              <span aria-hidden className="text-4xl">{l.emoji}</span>
              <span className="flex-1">
                <span className="block font-display text-lg font-black text-ink dark:text-white">{l.label}</span>
                <span className="block text-sm font-bold text-ink-soft dark:text-white/70">{l.blurb} ({poolSize(key)})</span>
              </span>
              {state.best[key] > 0 && (
                <span className="rounded-full bg-sun px-3 py-1 text-sm font-extrabold text-ink">Best ⭐ {state.best[key]}</span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => dispatch({ type: 'gameQuit' })} className="mt-5 h-12 w-full rounded-2xl font-display font-extrabold text-ink-soft hover:bg-sky-mist dark:text-white/70 dark:hover:bg-night-deep">
          Maybe later
        </button>
      </div>
    </Modal>
  )
}

export function GameHUD({ onCorrect }) {
  const { state, dispatch } = useApp()
  const g = state.game
  const { supported, speak } = useSpeech()
  const target = BY_ID[g.rounds[g.i]]
  const wrongName = g.wrong ? BY_ID[g.wrong]?.name || 'that place' : null
  const nextRef = useRef(null)

  // Say the question at the start of each round
  useEffect(() => {
    if (g.phase === 'ask' && g.tries === 0) speak(`Can you find ${target.name}?`)
  }, [g.i, g.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Feedback after every tap
  useEffect(() => {
    if (g.phase === 'ask' && g.tries > 0) speak(`That's ${wrongName}. Try again! ${hintFor(target.id, g.tries)}`)
    if (g.phase === 'right') {
      speak(`${cheer(g.results[g.i])} That's ${target.name}!`)
      onCorrect?.()
    }
    if (g.phase === 'reveal') speak(`Here is ${target.name}.`)
    if (g.phase === 'right' || g.phase === 'reveal') nextRef.current?.focus({ preventScroll: true })
  }, [g.tries, g.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const done = g.phase === 'right' || g.phase === 'reveal'
  const roundStars = done ? g.results[g.i] : null

  return (
    <section
      aria-label="Find it! game"
      aria-live="polite"
      className="fixed inset-x-3 top-[4.5rem] z-30 mx-auto max-w-lg animate-rise rounded-blob bg-white p-4 shadow-float dark:bg-night-card md:top-4"
    >
      <div className="flex items-center gap-2">
        <ol className="flex gap-1.5" aria-label={`Country ${g.i + 1} of ${ROUNDS}`}>
          {Array.from({ length: ROUNDS }, (_, i) => (
            <li
              key={i}
              className={`h-2.5 w-7 rounded-full ${i < g.results.length ? (g.results[i] > 0 ? 'bg-namerica' : 'bg-ink/25 dark:bg-white/25') : i === g.i ? 'bg-sun' : 'bg-ink/10 dark:bg-white/10'}`}
            />
          ))}
        </ol>
        <span className="ml-1 text-sm font-extrabold text-ink-soft dark:text-white/70">{g.i + 1} of {ROUNDS}</span>
        <button
          onClick={() => dispatch({ type: 'gameQuit' })}
          className="ml-auto h-11 rounded-xl px-3 text-sm font-extrabold text-ink-soft hover:bg-sky-mist dark:text-white/70 dark:hover:bg-night-deep"
        >
          Stop game
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Flag id={target.id} title={target.name} className="h-12 w-[4.5rem] shrink-0 rounded-lg ring-1 ring-ink/15 dark:ring-white/20" />
        <div className="min-w-0 flex-1">
          {done ? (
            <>
              <p className="font-display text-lg font-black leading-tight text-ink dark:text-white sm:text-xl">{cheer(roundStars)}</p>
              <p className="font-bold text-ink-soft dark:text-white/70">That's {target.name}.</p>
            </>
          ) : (
            <p className="font-display text-xl font-black leading-tight text-ink dark:text-white">
              Find <span className="rounded-lg bg-sun px-1.5 text-ink">{target.name}</span>!
            </p>
          )}
        </div>
        {supported && !done && (
          <button
            onClick={() => speak(`Can you find ${target.name}?`)}
            aria-label="Say it again"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-mist text-xl transition hover:scale-105 hover:bg-sky-day dark:bg-night-deep dark:hover:bg-night-line"
          >
            🔊
          </button>
        )}
      </div>

      {!done && g.tries > 0 && (
        <p className="mt-3 animate-fade rounded-2xl bg-sky-mist px-4 py-2.5 font-bold text-ink dark:bg-night-deep/70 dark:text-white">
          That's {wrongName}. Try again! <span className="text-ink-soft dark:text-white/70">{hintFor(target.id, g.tries)}</span>
        </p>
      )}

      {done && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Stars n={roundStars} />
          <button
            ref={nextRef}
            onClick={() => dispatch({ type: 'gameNext' })}
            className="ml-auto h-14 whitespace-nowrap rounded-2xl bg-sun px-6 font-display text-lg font-black text-ink shadow-pop transition hover:scale-[1.03] hover:bg-sun-dark"
          >
            {g.i + 1 < ROUNDS ? 'Next country' : 'See my stars'}
          </button>
        </div>
      )}
    </section>
  )
}

export function GameDone() {
  const { state, dispatch } = useApp()
  const g = state.game
  const { speak } = useSpeech()
  const max = ROUNDS * 3
  useEffect(() => {
    speak(`You got ${g.total} stars!${g.newBest ? ' That is your best score!' : ''}`)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal label="Game results" onClose={() => dispatch({ type: 'gameQuit' })}>
      <div className="p-6 text-center md:p-7">
        <div className="text-6xl leading-none" aria-hidden>{g.total >= max - 3 ? '🏆' : g.total >= max / 2 ? '🎉' : '🌟'}</div>
        <h2 className="mt-3 font-display text-2xl font-black text-ink dark:text-white">You got {g.total} stars!</h2>
        <p className="mt-1 font-bold text-ink-soft dark:text-white/70">
          {g.newBest ? 'New best score!' : `Your best on ${LEVELS[g.level].label}: ${state.best[g.level]}`} · All stars so far: {state.starsTotal}
        </p>
        <ul className="mt-5 space-y-2 text-left">
          {g.rounds.map((id, i) => (
            <li key={id} className="flex items-center gap-3 rounded-2xl bg-sky-mist px-3 py-2 dark:bg-night-deep/70">
              <Flag id={id} className="h-7 w-10 rounded" />
              <span className="flex-1 font-bold text-ink dark:text-white">{BY_ID[id].name}</span>
              <Stars n={g.results[i]} size="text-lg" />
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => dispatch({ type: 'gameStart', level: g.level, rounds: pickRounds(g.level, g.rounds) })}
            className="h-14 rounded-2xl bg-sun font-display text-lg font-black text-ink shadow-pop transition hover:scale-[1.02] hover:bg-sun-dark"
          >
            Play again
          </button>
          <button
            onClick={() => dispatch({ type: 'gameOpen' })}
            className="h-14 rounded-2xl bg-white font-display text-lg font-black text-ink shadow-pop ring-2 ring-ink/10 transition hover:scale-[1.02] hover:bg-sky-day dark:bg-night-deep dark:text-white dark:ring-night-line"
          >
            Change level
          </button>
        </div>
        <button onClick={() => dispatch({ type: 'gameQuit' })} className="mt-3 h-12 w-full rounded-2xl font-display font-extrabold text-ink-soft hover:bg-sky-mist dark:text-white/70 dark:hover:bg-night-deep">
          Back to the globe
        </button>
      </div>
    </Modal>
  )
}
