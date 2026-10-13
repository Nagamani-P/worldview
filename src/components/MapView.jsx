/**
 * Flat world map (secondary view). SVG + d3-geo, same colours as the globe.
 * Drag to move, pinch/scroll or the +/- buttons to zoom.
 * Callouts are drawn in an HTML layer on top so they stay the same size at any zoom.
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import 'd3-transition'
import { GEO, TINY, BY_ID, featureColor } from '../lib/data'
import { countryAnchor, featureAnchor, flightLine } from '../lib/geoLookup'
import { TONE_FILL } from './callout'
import Callout from './Callout'

const W = 1000
const H = 520

function useBox(ref) {
  const [box, setBox] = useState({ w: 0, h: 0 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return box
}

function MapView({ marks = [], focus, panelOpen, homeId, arcToId, dark, onPick, hideNames = false }) {
  const boxRef = useRef(null)
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const zoomRef = useRef(null)
  const [hover, setHover] = useState(null) // { id, f? }
  const [t, setT] = useState(zoomIdentity)
  const box = useBox(boxRef)

  const { path, projection } = useMemo(() => {
    const projection = geoNaturalEarth1().fitExtent([[10, 10], [W - 10, H - 10]], { type: 'Sphere' })
    return { projection, path: geoPath(projection) }
  }, [])

  // Precompute path strings once (245 shapes)
  const shapes = useMemo(
    () => GEO.features.filter((f) => f.properties.id !== 'AQ').map((f) => ({ f, d: path(f) })),
    [path]
  )
  const sphere = useMemo(() => path({ type: 'Sphere' }), [path])
  const toneById = useMemo(() => Object.fromEntries(marks.map((m) => [m.id, m.tone])), [marks])

  useEffect(() => {
    const svg = select(svgRef.current)
    const z = d3zoom()
      .scaleExtent([1, 12])
      .translateExtent([[-W * 0.3, -H * 0.3], [W * 1.3, H * 1.3]])
      .clickDistance(6) // a small drag is still a tap
      .on('zoom', (e) => {
        select(gRef.current).attr('transform', e.transform)
        setT(e.transform)
      })
    svg.call(z)
    zoomRef.current = z
    return () => svg.on('.zoom', null)
  }, [])

  // Zoom to the focused country
  useEffect(() => {
    if (focus?.reset && zoomRef.current) {
      select(svgRef.current).transition().duration(700).call(zoomRef.current.transform, zoomIdentity)
      return
    }
    const c = focus?.id && BY_ID[focus.id]
    if (!c || !zoomRef.current) return
    const a = countryAnchor(focus.id)
    const [x, y] = projection([a.lng, a.lat])
    const scale = c.area > 3e6 ? 2 : c.area > 3e5 ? 3.5 : 6
    // Keep the country clear of the panel: left of centre on desktop, above centre on mobile
    const wide = window.innerWidth >= 768
    const cx = panelOpen && wide ? W * 0.36 : W / 2
    const cy = H / 2
    select(svgRef.current)
      .transition()
      .duration(900)
      .call(zoomRef.current.transform, zoomIdentity.translate(cx, cy).scale(scale).translate(-x, -y))
  }, [focus, projection, panelOpen])

  const zoomBy = (f) => select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, f)

  // viewBox -> pixel position inside the box (svg uses "meet" fitting)
  const toScreen = useMemo(() => {
    const s = Math.min(box.w / W, box.h / H) || 0
    const ox = (box.w - W * s) / 2
    const oy = (box.h - H * s) / 2
    return ([px, py]) => [ox + (t.x + t.k * px) * s, oy + (t.y + t.k * py) * s]
  }, [box, t])

  const callouts = useMemo(() => {
    const list = marks.map((m) => ({ ...m, label: m.label ?? (BY_ID[m.id]?.name || GEO.features.find((f) => f.properties.id === m.id)?.properties.name || ''), a: countryAnchor(m.id) }))
    if (hover && !hideNames && !toneById[hover.id]) {
      list.push({ id: hover.id, tone: 'hover', label: BY_ID[hover.id]?.name || hover.f?.properties.name, a: countryAnchor(hover.id) || (hover.f && featureAnchor(hover.f)) })
    }
    return list
      .filter((c) => c.a)
      .map((c) => {
        const [x, y] = toScreen(projection([c.a.lng, c.a.lat]))
        return { ...c, x, y }
      })
      .filter((c) => c.x > 8 && c.y > 8 && c.x < box.w - 8 && c.y < box.h - 4)
  }, [marks, hover, toneById, toScreen, projection, box, hideNames])

  const flight = useMemo(() => {
    if (!homeId || !arcToId || homeId === arcToId) return null
    const line = flightLine(homeId, arcToId)
    return line && path(line)
  }, [homeId, arcToId, path])

  const stroke = dark ? '#0C1433' : '#FFFFFF'
  const k = t.k

  return (
    // On phones the sheet covers the bottom 64% of the screen, so the map moves above it
    <div className={`absolute inset-0 flex items-center justify-center p-2 pt-20 transition-[padding] duration-300 md:pb-36 md:pt-24 ${panelOpen ? 'pb-[64vh]' : 'pb-28'}`}>
      <div ref={boxRef} className="relative h-full w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full touch-none select-none"
          role="img"
          aria-label="World map. Drag to move, pinch or scroll to zoom, tap a country to learn about it."
        >
          <g ref={gRef}>
            <path d={sphere} fill={dark ? '#1D4E9E' : '#3B7DD8'} />
            {shapes.map(({ f, d }, i) => {
              const id = f.properties.id
              const tone = toneById[id]
              return (
                <path
                  key={i}
                  d={d}
                  data-id={id}
                  fill={TONE_FILL[tone] || featureColor(f, { hover: hover?.id === id })}
                  stroke={stroke}
                  strokeWidth={0.6 / k}
                  className="cursor-pointer transition-[fill] duration-150"
                  onMouseEnter={() => setHover({ id, f })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onPick(f)}
                >
                  {!hideNames && <title>{BY_ID[id]?.name || f.properties.name}</title>}
                </path>
              )
            })}
            {flight && (
              <path d={flight} fill="none" stroke="#FFC93C" strokeWidth={3 / k} strokeLinecap="round" strokeDasharray={`${10 / k} ${6 / k}`} className="wv-flight" style={{ '--dash': `${-32 / k}px` }} />
            )}
            {TINY.map((c) => {
              const p = projection([c.lng, c.lat])
              return (
                <circle
                  key={c.id}
                  data-id={c.id}
                  cx={p[0]}
                  cy={p[1]}
                  r={4 / Math.sqrt(k)}
                  fill={TONE_FILL[toneById[c.id]] || '#FFFFFF'}
                  stroke="#1F2A44"
                  strokeWidth={1 / k}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover({ id: c.id })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onPick({ properties: { id: c.id } })}
                >
                  {!hideNames && <title>{c.name}</title>}
                </circle>
              )
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {callouts.map((c) => (
            <Callout key={`${c.tone}-${c.id}-${c.label}`} {...c} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-28 right-4 flex flex-col gap-2 md:bottom-auto md:left-4 md:right-auto md:top-24">
        {[['Zoom in', '+', 1.6], ['Zoom out', '−', 1 / 1.6]].map(([label, sym, f]) => (
          <button
            key={label}
            aria-label={label}
            onClick={() => zoomBy(f)}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white font-display text-xl font-extrabold text-ink shadow-pop transition hover:scale-105 hover:bg-sun dark:bg-night-card dark:text-white dark:hover:bg-sun dark:hover:text-ink"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(MapView)
