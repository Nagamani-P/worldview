/**
 * Geometry helpers shared by the globe and the map.
 * - paintWorld: draws every country, with its exact border, onto a canvas
 *   in equirectangular projection. The globe uses this canvas as its surface.
 * - featureAt: finds which country (or place) is at a lat/lng.
 */
import { geoEquirectangular, geoPath, geoContains, geoBounds } from 'd3-geo'
import { GEO, featureColor } from './data'

// Pre-compute bounding boxes so lookups only test a few shapes
const INDEX = GEO.features.map((f) => {
  const [[x0, y0], [x1, y1]] = geoBounds(f)
  return { f, x0, y0, x1, y1, wraps: x0 > x1 }
})

export function featureAt(lat, lng) {
  for (const b of INDEX) {
    if (lat < b.y0 || lat > b.y1) continue
    const inX = b.wraps ? lng >= b.x0 || lng <= b.x1 : lng >= b.x0 && lng <= b.x1
    if (inX && geoContains(b.f, [lng, lat])) return b.f
  }
  return null
}

export function paintWorld(canvas, { dark }) {
  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')
  const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]).precision(0.1)
  const path = geoPath(projection, ctx)

  ctx.fillStyle = dark ? '#1D4E9E' : '#3B7DD8'
  ctx.fillRect(0, 0, W, H)

  // Graticule-free ocean; lines come from the globe itself
  for (const f of GEO.features) {
    ctx.beginPath()
    path(f)
    ctx.fillStyle = featureColor(f)
    ctx.fill()
  }
  ctx.lineJoin = 'round'
  ctx.lineWidth = W / 3000
  ctx.strokeStyle = dark ? 'rgba(12,20,51,0.7)' : 'rgba(255,255,255,0.85)'
  for (const f of GEO.features) {
    ctx.beginPath()
    path(f)
    ctx.stroke()
  }
}

/* ---------- Callout anchors ---------- */
import polylabel from 'polylabel'
import { geoArea, geoDistance, geoInterpolate } from 'd3-geo'
import { BY_ID } from './data'

/**
 * Where a callout should point for a shape: the most "inside" point of its
 * largest landmass (polylabel). The plain centre fails for odd shapes:
 * the USA's centre is in Canada (because of Alaska), Indonesia's is in the sea.
 */
const ANCHOR_CACHE = new Map()
export function featureAnchor(f) {
  if (ANCHOR_CACHE.has(f)) return ANCHOR_CACHE.get(f)
  const g = f.geometry
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
  let best = polys[0], bestA = -1
  for (const p of polys) {
    const a = geoArea({ type: 'Polygon', coordinates: p })
    if (a > bestA) { bestA = a; best = p }
  }
  const [lng, lat] = polylabel(best, 0.2)
  const out = { lat, lng }
  ANCHOR_CACHE.set(f, out)
  return out
}

// Some countries have extra small shapes with the same code (e.g. a disputed
// islet next to Brazil). Keep all of them, and use the biggest for anchors.
const FEATURES_BY_ID = new Map()
for (const f of GEO.features) {
  const id = f.properties.id
  if (!FEATURES_BY_ID.has(id)) FEATURES_BY_ID.set(id, [])
  FEATURES_BY_ID.get(id).push(f)
}
for (const list of FEATURES_BY_ID.values()) list.sort((a, b) => geoArea(b) - geoArea(a))
const FEATURE_BY_ID = new Map([...FEATURES_BY_ID].map(([id, list]) => [id, list[0]]))
/** The main shape for an id */
export const featureById = (id) => FEATURE_BY_ID.get(id) || null
/** Every shape for an id (for highlighting the whole country) */
export const featuresById = (id) => FEATURES_BY_ID.get(id) || []

/** Anchor for a country id. Tiny countries with no shape use their dot. */
export function countryAnchor(id) {
  const f = FEATURE_BY_ID.get(id)
  if (f) return featureAnchor(f)
  const c = BY_ID[id]
  return c ? { lat: c.lat, lng: c.lng } : null
}

/* ---------- Distance between countries ---------- */
const EARTH_KM = 6371

/** Great-circle distance in km between two countries' anchor points */
export function distanceKm(aId, bId) {
  const a = countryAnchor(aId), b = countryAnchor(bId)
  if (!a || !b) return null
  return geoDistance([a.lng, a.lat], [b.lng, b.lat]) * EARTH_KM
}

/** Points along the great circle, for drawing the flight line on the flat map */
export function flightLine(aId, bId, steps = 48) {
  const a = countryAnchor(aId), b = countryAnchor(bId)
  if (!a || !b) return null
  const interp = geoInterpolate([a.lng, a.lat], [b.lng, b.lat])
  return { type: 'LineString', coordinates: Array.from({ length: steps + 1 }, (_, i) => interp(i / steps)) }
}
