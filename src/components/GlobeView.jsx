/**
 * The 3D globe (react-globe.gl on three.js).
 * - Every country is painted onto the globe surface with its exact border
 *   (one texture, light enough for tablets). Only the hovered and the marked
 *   countries are drawn as raised 3D shapes on top.
 * - Callouts: a pill with the country name and a line pointing to the country.
 *   Hover gets a light callout, selected / game answers get a strong one.
 *   Callouts hide when their country turns to the back of the globe.
 * - Flight arc from the child's home country to the selected one.
 * - Small countries also get a dot so little fingers can hit them.
 * - Auto-spin stops as soon as the child touches the globe, and comes back
 *   after a quiet spell when nothing is open.
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { MeshPhongMaterial, CanvasTexture, SRGBColorSpace } from 'three'
import { TINY, BY_ID, featureColor } from '../lib/data'
import { paintWorld, featureAt, featureById, featuresById, featureAnchor, countryAnchor } from '../lib/geoLookup'
import { makeCalloutEl, TONE_FILL } from './callout'

const RESUME_SPIN_MS = 12000

function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return size
}

const nameOf = (id, f) => BY_ID[id]?.name || f?.properties.name || ''

function GlobeView({ marks = [], focus, panelOpen, still, homeId, arcToId, dark, onPick, onReady, hideNames = false }) {
  const wrapRef = useRef(null)
  const globeRef = useRef(null)
  const idleTimer = useRef(null)
  const { w, h } = useSize(wrapRef)
  const [hover, setHover] = useState(null)
  const isMobile = w < 768

  // Paint the world once per theme. 4096 x 2048 keeps borders crisp when zoomed.
  const material = useMemo(() => {
    const canvas = document.createElement('canvas')
    const big = window.devicePixelRatio > 1 || window.innerWidth > 1200 ? 4096 : 2048
    canvas.width = big
    canvas.height = big / 2
    paintWorld(canvas, { dark })
    const map = new CanvasTexture(canvas)
    map.colorSpace = SRGBColorSpace
    map.anisotropy = 4
    return new MeshPhongMaterial({ map, shininess: 6 })
  }, [dark])
  useEffect(() => () => { material.map?.dispose(); material.dispose() }, [material])

  // Tone for each marked id (active / good / bad / reveal / home)
  const toneById = useMemo(() => Object.fromEntries(marks.map((m) => [m.id, m.tone])), [marks])

  // Raised layer: hovered + marked shapes only
  const raised = useMemo(() => {
    const list = marks.flatMap((m) => featuresById(m.id))
    if (hover && !toneById[hover.properties.id]) {
      const all = featuresById(hover.properties.id)
      list.push(...(all.length ? all : [hover]))
    }
    return list.filter((f) => f.geometry)
  }, [marks, hover, toneById])

  // Callouts: marked countries, plus a light one for the hovered country
  const callouts = useMemo(() => {
    const list = marks
      .map((m) => {
        const a = countryAnchor(m.id)
        return a && { ...m, ...a, label: m.label ?? nameOf(m.id, featureById(m.id)) }
      })
      .filter(Boolean)
    // No hover names during the game, or it would give the answer away
    if (hover && !hideNames && !toneById[hover.properties.id]) {
      const a = countryAnchor(hover.properties.id) || featureAnchor(hover)
      list.push({ id: hover.properties.id, tone: 'hover', label: nameOf(hover.properties.id, hover), ...a })
    }
    return list
  }, [marks, hover, toneById, hideNames])

  // Re-use callout DOM nodes so they don't flicker on every render
  const elCache = useRef(new Map())
  const calloutEl = useCallback((d) => {
    const key = `${d.tone}|${d.id}|${d.label}|${d.flag ? 1 : 0}`
    let el = elCache.current.get(key)
    if (!el) {
      el = makeCalloutEl(d)
      elCache.current.set(key, el)
      if (elCache.current.size > 60) elCache.current.delete(elCache.current.keys().next().value)
    }
    return el
  }, [])

  // Hover: find the country under the pointer (desktop only), once per frame
  const rafRef = useRef(0)
  const onPointerMove = useCallback((e) => {
    if (isMobile || !globeRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const c = globeRef.current?.toGlobeCoords(x, y)
      const f = c ? featureAt(c.lat, c.lng) : null
      setHover((prev) => (prev === f ? prev : f))
    })
  }, [isMobile])

  const handleGlobeClick = useCallback(({ lat, lng }) => {
    const f = featureAt(lat, lng)
    if (f) onPick(f)
  }, [onPick])

  // Controls: zoom limits, spin, stop on touch
  const setupControls = useCallback(() => {
    const g = globeRef.current
    if (!g) return
    const c = g.controls()
    c.autoRotate = true
    c.autoRotateSpeed = 0.45
    c.enableDamping = true
    c.minDistance = 130
    c.maxDistance = 520
    c.zoomSpeed = 0.8
    c.addEventListener('start', () => {
      c.autoRotate = false
      clearTimeout(idleTimer.current)
    })
    // Fit the whole globe on narrow portrait screens
    const aspect = (wrapRef.current?.clientWidth || 1) / (wrapRef.current?.clientHeight || 1)
    g.pointOfView({ lat: 20, lng: 78, altitude: aspect < 0.8 ? 3.9 : 2.3 }, 0)
    // Test hook, only with ?wvdebug in the URL: lets automated tests aim the camera
    if (new URLSearchParams(location.search).has('wvdebug')) window.__wv = { globe: g, anchor: countryAnchor }
    onReady?.()
  }, [onReady])

  // Resume spinning after a quiet spell, only when nothing is open
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const c = g.controls()
    clearTimeout(idleTimer.current)
    if (still) {
      c.autoRotate = false
      return
    }
    idleTimer.current = setTimeout(() => (c.autoRotate = true), RESUME_SPIN_MS)
    return () => clearTimeout(idleTimer.current)
  }, [still])

  // Fly to the focused country (selection, or the answer in the game)
  useEffect(() => {
    const g = globeRef.current
    if (focus?.reset && g) {
      const aspect = (wrapRef.current?.clientWidth || 1) / (wrapRef.current?.clientHeight || 1)
      g.pointOfView({ altitude: aspect < 0.8 ? 3.9 : 2.5 }, 900)
      return
    }
    const c = focus?.id && BY_ID[focus.id]
    if (!c || !g) return
    g.controls().autoRotate = false
    const a = countryAnchor(focus.id)
    const base = c.area > 3e6 ? 1.9 : c.area > 3e5 ? 1.5 : 1.15
    // Mobile with a sheet open: pull back and place the country above the sheet.
    // Desktop with a panel open: nudge the country left of the panel.
    const alt = isMobile ? base * 1.6 : base
    const lngShift = panelOpen && !isMobile ? alt * 12 : 0
    const latShift = panelOpen && isMobile ? -alt * 11 : 0
    g.pointOfView({ lat: a.lat + latShift, lng: a.lng + lngShift, altitude: alt }, 1200)
  }, [focus, isMobile, panelOpen])

  const polyColor = useCallback(
    (f) => TONE_FILL[toneById[f.properties.id]] || featureColor(f, { hover: true }),
    [toneById]
  )
  const polyAlt = useCallback((f) => (toneById[f.properties.id] ? 0.025 : 0.015), [toneById])

  // Flight arc from home
  const arcs = useMemo(() => {
    if (!homeId || !arcToId || homeId === arcToId) return []
    const a = countryAnchor(homeId), b = countryAnchor(arcToId)
    return a && b ? [{ startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng }] : []
  }, [homeId, arcToId])

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      style={{ cursor: hover ? 'pointer' : 'grab' }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setHover(null)}
      aria-label="Spinning globe. Drag to turn it, pinch or scroll to zoom, tap a country to learn about it."
      role="application"
    >
      {w > 0 && (
        <Globe
          ref={globeRef}
          width={w}
          height={h}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={material}
          showAtmosphere
          atmosphereColor={dark ? '#7FB2FF' : '#FFFFFF'}
          atmosphereAltitude={0.18}
          showGraticules
          polygonsData={raised}
          polygonCapColor={polyColor}
          polygonSideColor={() => 'rgba(20,30,60,0.25)'}
          polygonStrokeColor={() => (dark ? 'rgba(12,20,51,0.55)' : 'rgba(255,255,255,0.75)')}
          polygonAltitude={polyAlt}
          polygonsTransitionDuration={200}
          onPolygonClick={(f) => onPick(f)}
          onGlobeClick={handleGlobeClick}
          pointsData={TINY}
          pointLat="lat"
          pointLng="lng"
          pointColor={(c) => TONE_FILL[toneById[c.id]] || '#FFFFFF'}
          pointAltitude={0.012}
          pointRadius={isMobile ? 0.9 : 0.6}
          onPointClick={(c) => onPick({ properties: { id: c.id } })}
          onPointHover={isMobile ? undefined : (c) => setHover(c ? featureById(c.id) || { properties: { id: c.id, name: c.name } } : null)}
          htmlElementsData={callouts}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.03}
          htmlElement={calloutEl}
          htmlTransitionDuration={0}
          htmlElementVisibilityModifier={(el, visible) => {
            el.style.opacity = visible ? 1 : 0
          }}
          arcsData={arcs}
          arcColor={() => ['#FFFFFF', '#FFC93C']}
          arcStroke={0.7}
          arcDashLength={0.35}
          arcDashGap={0.15}
          arcDashAnimateTime={2200}
          arcAltitudeAutoScale={0.45}
          arcsTransitionDuration={0}
          onGlobeReady={setupControls}
          rendererConfig={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        />
      )}
    </div>
  )
}

export default memo(GlobeView)
