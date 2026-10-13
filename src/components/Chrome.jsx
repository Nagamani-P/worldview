/** Top bar (all sizes), view switch + legend (tablet/desktop), bottom nav (mobile). */
import { useApp } from '../context/AppContext'
import { CONTINENTS } from '../lib/data'
import Search from './Search'
import Logo from './Logo'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

const btn =
  'grid h-12 min-w-12 place-items-center rounded-2xl bg-white px-3 font-display font-extrabold text-ink shadow-pop transition hover:scale-105 hover:bg-sky-day dark:bg-night-card dark:text-white dark:hover:bg-night-line'

const btnSun =
  'grid h-12 min-w-12 place-items-center rounded-2xl bg-sun px-3 font-display font-extrabold text-ink shadow-pop transition hover:scale-105 hover:bg-sun-dark'

export function ThemeButton() {
  const { state, dispatch } = useApp()
  const dark = state.theme === 'dark'
  return (
    <button className={btn} onClick={() => dispatch({ type: 'toggleTheme' })} aria-label={dark ? 'Switch to day mode' : 'Switch to night mode'}>
      <span aria-hidden className="text-xl">{dark ? '☀️' : '🌙'}</span>
    </button>
  )
}

export function TopBar({ onPick, stampCount }) {
  const { state, dispatch } = useApp()
  const { canInstall, install } = useInstallPrompt()
  const playing = !!state.game && state.game.phase !== 'setup'
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center gap-3 p-3 md:p-4" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
      <h1 className="pointer-events-auto flex items-center gap-2 font-display text-lg font-black tracking-tight text-ink dark:text-white md:text-xl">
        <Logo size={46} className="shrink-0 drop-shadow-[0_3px_0_rgba(31,42,68,0.18)]" />
        <span className="whitespace-nowrap md:sr-only lg:not-sr-only">World View</span>
      </h1>
      {!playing && (
        <div className="pointer-events-auto mx-auto hidden w-full max-w-md md:block md:min-w-[16rem]">
          <Search onPick={onPick} shortcut />
        </div>
      )}
      <div className="pointer-events-auto ml-auto flex gap-2 md:ml-0">
        {canInstall && (
          <button className={`${btn} hidden gap-2 lg:flex`} onClick={install}>
            <span aria-hidden className="text-xl">📲</span>
            <span>Install</span>
          </button>
        )}
        {!playing && (
          <>
            <button className={`${btnSun} hidden gap-2 md:flex`} onClick={() => dispatch({ type: 'gameOpen' })}>
              <span aria-hidden className="text-xl">🎯</span>
              <span className="md:sr-only lg:not-sr-only">Find it!</span>
            </button>
            <button className={`${btn} hidden gap-2 md:flex`} onClick={() => dispatch({ type: 'passport', open: true })}>
              <span aria-hidden className="text-xl">🛂</span>
              <span className="md:sr-only lg:not-sr-only">Passport</span>
              <span className="rounded-full bg-sun px-2 text-sm text-ink">{stampCount}</span>
            </button>
          </>
        )}
        <ThemeButton />
      </div>
    </header>
  )
}

export function ViewSwitch() {
  const { state, dispatch } = useApp()
  const opts = [['globe', '🌐', 'Globe'], ['map', '🗺️', 'Map']]
  return (
    <div role="radiogroup" aria-label="Choose view" className="flex rounded-2xl bg-white p-1 shadow-pop dark:bg-night-card">
      {opts.map(([v, icon, label]) => {
        const on = state.view === v
        return (
          <button
            key={v}
            role="radio"
            aria-checked={on}
            onClick={() => dispatch({ type: 'setView', view: v })}
            className={`flex h-11 items-center gap-2 rounded-xl px-4 font-display font-extrabold transition ${on ? 'bg-ink text-white dark:bg-sun dark:text-ink' : 'text-ink hover:bg-sky-day dark:text-white dark:hover:bg-night-line'}`}
          >
            <span aria-hidden>{icon}</span>{label}
          </button>
        )
      })}
    </div>
  )
}

export function Legend() {
  return (
    <ul aria-label="Continent colours" className="flex flex-wrap gap-x-4 gap-y-1 rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-ink backdrop-blur dark:bg-night-card/80 dark:text-white">
      {Object.entries(CONTINENTS).map(([name, c]) => (
        <li key={name} className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-full" style={{ background: c.color }} aria-hidden />
          {name}
        </li>
      ))}
    </ul>
  )
}

export function DesktopDock() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-20 hidden flex-col items-start gap-3 p-4 md:flex">
      <div className="pointer-events-auto"><ViewSwitch /></div>
      <div className="pointer-events-auto max-w-[calc(100vw-470px)]"><Legend /></div>
    </div>
  )
}

export function BottomNav({ onFind, stampCount }) {
  const { state, dispatch } = useApp()
  const playing = !!state.game && state.game.phase !== 'setup'
  const globeOn = state.view === 'globe'
  const items = [
    // One button flips between globe and map to leave room for the game
    { key: 'view', icon: globeOn ? '🗺️' : '🌐', label: globeOn ? 'Map' : 'Globe', on: false, act: () => dispatch({ type: 'setView', view: globeOn ? 'map' : 'globe' }) },
    { key: 'find', icon: '🔍', label: 'Search', on: false, act: onFind },
    { key: 'play', icon: '🎯', label: 'Find it!', on: false, act: () => dispatch({ type: 'gameOpen' }), hot: true },
    { key: 'pass', icon: '🛂', label: `Passport`, badge: stampCount, on: false, act: () => dispatch({ type: 'passport', open: true }) },
  ]
  if (playing) return null
  return (
    <nav aria-label="Main" className="fixed inset-x-3 z-20 flex rounded-3xl bg-white p-1.5 shadow-float dark:bg-night-card md:hidden" style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={it.act}
          className={`relative flex h-14 flex-1 flex-col items-center justify-center rounded-2xl text-sm font-extrabold transition ${it.hot ? 'bg-sun text-ink' : 'text-ink dark:text-white'}`}
        >
          <span aria-hidden className="text-xl leading-none">{it.icon}</span>
          {it.label}
          {it.badge > 0 && <span className="absolute right-3 top-1 rounded-full bg-sun px-1.5 text-xs text-ink">{it.badge}</span>}
        </button>
      ))}
    </nav>
  )
}
