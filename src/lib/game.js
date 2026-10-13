/**
 * "Find it!" game rules. Pure helpers; state lives in AppContext.
 * A game is 5 rounds. Each round asks for one country.
 * Stars per round: 3 on the first tap, 2 on the second, 1 on the third,
 * then the answer is shown and the round gives 0.
 */
import { COUNTRIES, BY_ID } from './data'

export const ROUNDS = 5
export const MAX_TRIES = 3

export const LEVELS = {
  easy: { label: 'Easy', emoji: '🐣', blurb: 'Big countries', filter: (c) => c.area >= 1_000_000 },
  medium: { label: 'Medium', emoji: '🦊', blurb: 'Most countries', filter: (c) => c.area >= 150_000 },
  hard: { label: 'Hard', emoji: '🦁', blurb: 'All 195, even tiny ones', filter: () => true },
}

export const poolSize = (level) => COUNTRIES.filter(LEVELS[level].filter).length

/** Pick distinct countries, leaving out the ones from the last game when possible */
export function pickRounds(level, avoid = []) {
  const pool = COUNTRIES.filter(LEVELS[level].filter).map((c) => c.id)
  const fresh = pool.filter((id) => !avoid.includes(id))
  const from = fresh.length >= ROUNDS ? fresh : pool
  const out = []
  const bag = [...from]
  while (out.length < ROUNDS && bag.length) out.push(bag.splice(Math.floor(Math.random() * bag.length), 1)[0])
  return out
}

export const starsFor = (tries) => Math.max(0, MAX_TRIES - tries)

/** Hint text after a wrong tap */
export function hintFor(id, tries) {
  const c = BY_ID[id]
  if (!c || tries === 0) return ''
  if (tries === 1) return `Hint: it's in ${c.continent}.`
  const near = c.borders.map((a3) => COUNTRIES.find((x) => x.a3 === a3)).filter(Boolean)
  if (near.length) return `Hint: it's next to ${near[Math.floor(near.length / 2)].name}.`
  return c.landlocked ? `Hint: it has no sea.` : `Hint: look for an island or a coast in ${c.continent}.`
}

export function cheer(stars) {
  return ['Here it is!', 'You found it!', 'Great job!', 'Amazing! First try!'][stars]
}
