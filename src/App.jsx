/**
 * World View: app shell.
 * Globe is the default view; the flat map is the secondary view.
 */
import { Component, Suspense, lazy, useCallback, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { useApp } from './context/AppContext'
import { BY_ID } from './lib/data'
import { TopBar, DesktopDock, BottomNav } from './components/Chrome'
import CountryPanel from './components/CountryPanel'
import PlacePanel from './components/PlacePanel'
import PassportModal from './components/PassportModal'
import WelcomeModal from './components/WelcomeModal'
import Search from './components/Search'
import { GameSetup, GameHUD, GameDone } from './components/Game'

// The globe pulls in three.js, so load it separately and show a skeleton meanwhile
const GlobeView = lazy(() => import('./components/GlobeView'))
const MapView = lazy(() => import('./components/MapView'))

const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
})()

/** If the globe crashes (old device, GPU issue), fall back to the map */
class GlobeBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.warn('Globe failed, showing map instead', err) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function GlobeSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-busy="true" aria-label="Loading the globe">
      <div className="relative h-[min(70vw,70vh)] w-[min(70vw,70vh)] animate-pulse rounded-full bg-ocean/40 dark:bg-ocean/30">
        <span className="absolute inset-0 grid place-items-center font-display text-lg font-extrabold text-ink/70 dark:text-white/70">Getting the globe ready…</span>
      </div>
    </div>
  )
}

function Stars() {
  // Static star field for night mode. Cheap: one element with many shadows.
  const shadow = useMemo(() => {
    const s = []
    for (let i = 0; i < 140; i++) s.push(`${Math.round(Math.random() * 2000)}px ${Math.round(Math.random() * 1400)}px rgba(255,255,255,${(0.3 + Math.random() * 0.6).toFixed(2)})`)
    return s.join(',')
  }, [])
  return <div aria-hidden className="pointer-events-none fixed left-0 top-0 hidden h-[2px] w-[2px] rounded-full dark:block" style={{ boxShadow: shadow }} />
}

export default function App() {
  const { state, dispatch } = useApp()
  const [findOpen, setFindOpen] = useState(false)
  const [globeReady, setGlobeReady] = useState(false)
  const dark = state.theme === 'dark'
  const view = hasWebGL ? state.view : 'map'
  const selectedId = state.selected?.kind === 'country' ? state.selected.id : null

  const pickId = useCallback((id) => dispatch({ type: 'select', payload: { kind: 'country', id } }), [dispatch])
  const pickFeature = useCallback(
    (f) => {
      const id = f.properties.id
      if (BY_ID[id]) pickId(id)
      else dispatch({ type: 'select', payload: { kind: 'place', feature: f } })
    },
    [dispatch, pickId]
  )
  const close = useCallback(() => dispatch({ type: 'close' }), [dispatch])
  const onReady = useCallback(() => setGlobeReady(true), [])

  const party = useCallback((x = 0.5, y = 0.8) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    confetti({ particleCount: 110, spread: 75, origin: { x, y }, colors: ['#FFC93C', '#F2685E', '#7B6CF6', '#3CC48A', '#2EC4D6', '#FF8FB1'] })
  }, [])
  const stamp = (id) => {
    dispatch({ type: 'stamp', id })
    party(window.innerWidth > 768 ? 0.82 : 0.5)
  }

  /* ---- What the globe/map should show: callouts, focus, flight arc ---- */
  const g = state.game
  const playing = !!g && ['ask', 'right', 'reveal'].includes(g.phase)
  const target = playing ? g.rounds[g.i] : null

  const marks = useMemo(() => {
    if (playing) {
      const nameOf = (id) => BY_ID[id]?.name || 'there'
      if (g.phase === 'ask') return g.wrong ? [{ id: g.wrong, tone: 'bad', label: `That's ${nameOf(g.wrong)}` }] : []
      if (g.phase === 'right') return [{ id: target, tone: 'good', flag: true }]
      return [{ id: target, tone: 'reveal', label: `Here is ${nameOf(target)}`, flag: true }]
    }
    const sel = state.selected
    if (!sel) return []
    if (sel.kind === 'place') return [{ id: sel.feature.properties.id, tone: 'active' }]
    const list = [{ id: sel.id, tone: 'active', flag: true }]
    if (state.home && state.home !== sel.id) list.push({ id: state.home, tone: 'home', label: 'Home' })
    return list
  }, [playing, g, target, state.selected, state.home])

  // A new object each time the camera should move
  const focus = useMemo(() => {
    // Each round starts from the whole world; the answer is shown on reveal
    if (playing) return g.phase === 'reveal' ? { id: target, n: g.nonce } : g.tries === 0 && g.phase === 'ask' ? { reset: true, n: g.i } : null
    return selectedId ? { id: selectedId } : null
  }, [playing, g?.phase, g?.nonce, g?.i, target, selectedId, state.selected]) // eslint-disable-line react-hooks/exhaustive-deps

  const arcToId = playing ? null : selectedId
  const panelOpen = !playing && !!state.selected

  // Taps go to the game while it's asking, otherwise they open the panel
  const onPick = useCallback(
    (f) => {
      if (g && g.phase !== 'ask') return
      if (g) return dispatch({ type: 'gameTap', id: f.properties.id })
      pickFeature(f)
    },
    [g, dispatch, pickFeature]
  )

  const viewProps = { marks, focus, panelOpen, homeId: state.home, arcToId, dark, onPick, hideNames: playing }
  const map = <MapView {...viewProps} />
  const stampCount = Object.keys(state.stamps).length

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-sky-day to-sky-mist font-body text-ink dark:from-night-deep dark:to-night">
      <Stars />

      <main className="absolute inset-0" aria-label={view === 'globe' ? 'Globe' : 'World map'}>
        <div key={view} className="absolute inset-0 animate-fade">
          <Suspense fallback={<GlobeSkeleton />}>
            {view === 'globe' ? (
              <GlobeBoundary fallback={map}>
                {!globeReady && <GlobeSkeleton />}
                <GlobeView {...viewProps} still={!!state.selected || !!g} onReady={onReady} />
              </GlobeBoundary>
            ) : (
              map
            )}
          </Suspense>
        </div>
      </main>

      <TopBar onPick={pickId} stampCount={stampCount} />
      <DesktopDock />
      <BottomNav onFind={() => setFindOpen(true)} stampCount={stampCount} />

      {!hasWebGL && (
        <p className="fixed left-1/2 top-20 z-20 -translate-x-1/2 rounded-2xl bg-white px-4 py-2 text-sm font-bold shadow-pop dark:bg-night-card dark:text-white">
          This device can't show the 3D globe, so here is the map.
        </p>
      )}

      {/* Mobile search overlay */}
      {findOpen && (
        <div className="fixed inset-0 z-40 animate-fade bg-night-deep/40 p-3 pt-20 backdrop-blur-sm md:hidden" onMouseDown={(e) => e.target === e.currentTarget && setFindOpen(false)}>
          <Search onPick={pickId} autoFocus onDone={() => setFindOpen(false)} />
        </div>
      )}

      {!g && state.selected?.kind === 'country' && (
        <CountryPanel
          key={selectedId}
          id={selectedId}
          stamped={!!state.stamps[selectedId]}
          onStamp={stamp}
          onClose={close}
          onPick={pickId}
          homeId={state.home}
          onMakeHome={(id) => dispatch({ type: 'setHome', id })}
        />
      )}
      {!g && state.selected?.kind === 'place' && <PlacePanel feature={state.selected.feature} onClose={close} onPick={pickId} />}

      {playing && <GameHUD key={g.i} onCorrect={() => party(0.5, 0.35)} />}
      {g?.phase === 'setup' && <GameSetup />}
      {g?.phase === 'done' && <GameDone />}

      {state.passportOpen && <PassportModal onPick={pickId} />}
      {!state.welcomed && <WelcomeModal />}
    </div>
  )
}
