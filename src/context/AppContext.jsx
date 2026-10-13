/**
 * App-wide state with useReducer + Context.
 * Persisted to localStorage: theme, view, explorer name, home country, stamps,
 * welcomed, game stars and best scores.
 * Not persisted: selection, search, open dialogs, the game in progress.
 */
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadState, saveState } from '../lib/storage'
import { BY_ID } from '../lib/data'
import { ROUNDS, MAX_TRIES, starsFor } from '../lib/game'

const AppContext = createContext(null)

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

/** Guess home from the browser language region (en-IN -> IN). Changeable in the welcome and passport. */
function guessHome() {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region
    return BY_ID[region] ? region : null
  } catch {
    return null
  }
}

function initState() {
  const saved = loadState() || {}
  return {
    // Saved choice first, then a host page's data-theme, then the device setting
    theme: saved.theme || document.documentElement.dataset.theme || (prefersDark() ? 'dark' : 'light'),
    view: saved.view || 'globe', // 'globe' | 'map'
    explorerName: saved.explorerName || '',
    stamps: saved.stamps || {}, // { [countryId]: 'YYYY-MM-DD' }
    welcomed: !!saved.welcomed,
    home: saved.home === undefined ? guessHome() : saved.home,
    starsTotal: saved.starsTotal || 0,
    best: saved.best || {}, // { easy: 12, medium: 9 }
    lastRounds: saved.lastRounds || [],
    game: null, // see game reducer below
    selected: null, // { kind: 'country', id } | { kind: 'place', feature }
    passportOpen: false,
    lastStamp: null,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'select':
      return { ...state, selected: action.payload }
    case 'close':
      return { ...state, selected: null }
    case 'setView':
      return { ...state, view: action.view }
    case 'toggleTheme':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' }
    case 'welcome':
      return { ...state, welcomed: true, explorerName: action.name ?? state.explorerName }
    case 'setName':
      return { ...state, explorerName: action.name }
    case 'stamp':
      if (state.stamps[action.id]) return state
      return {
        ...state,
        stamps: { ...state.stamps, [action.id]: new Date().toISOString().slice(0, 10) },
        lastStamp: action.id,
      }
    case 'passport':
      return { ...state, passportOpen: action.open }
    case 'resetPassport':
      return { ...state, stamps: {}, lastStamp: null }
    case 'setHome':
      return { ...state, home: action.id }

    /* ---- Find it! game ---- */
    case 'gameOpen':
      return { ...state, selected: null, passportOpen: false, game: { phase: 'setup' } }
    case 'gameStart':
      return {
        ...state,
        selected: null,
        lastRounds: action.rounds,
        game: { phase: 'ask', level: action.level, rounds: action.rounds, i: 0, tries: 0, wrong: null, results: [], nonce: 0 },
      }
    case 'gameTap': {
      const g = state.game
      if (!g || g.phase !== 'ask') return state
      const target = g.rounds[g.i]
      if (action.id === target) {
        return { ...state, game: { ...g, phase: 'right', wrong: null, results: [...g.results, starsFor(g.tries)] } }
      }
      const tries = g.tries + 1
      if (tries >= MAX_TRIES) {
        return { ...state, game: { ...g, tries, phase: 'reveal', wrong: action.id, results: [...g.results, 0], nonce: g.nonce + 1 } }
      }
      return { ...state, game: { ...g, tries, wrong: action.id } }
    }
    case 'gameNext': {
      const g = state.game
      if (!g) return state
      if (g.i + 1 < ROUNDS) return { ...state, game: { ...g, i: g.i + 1, tries: 0, wrong: null, phase: 'ask' } }
      const total = g.results.reduce((a, b) => a + b, 0)
      return {
        ...state,
        starsTotal: state.starsTotal + total,
        best: { ...state.best, [g.level]: Math.max(state.best[g.level] || 0, total) },
        game: { ...g, phase: 'done', total, newBest: total > (state.best[g.level] || 0) },
      }
    }
    case 'gameQuit':
      return { ...state, game: null }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  // Persist the parts worth keeping
  useEffect(() => {
    const { theme, view, explorerName, stamps, welcomed, home, starsTotal, best, lastRounds } = state
    saveState({ theme, view, explorerName, stamps, welcomed, home, starsTotal, best, lastRounds })
  }, [state.theme, state.view, state.explorerName, state.stamps, state.welcomed, state.home, state.starsTotal, state.best, state.lastRounds])

  // Theme class on <html> so Tailwind dark: variants work everywhere
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.theme === 'dark' ? '#0C1433' : '#D6EEFF')
  }, [state.theme])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
