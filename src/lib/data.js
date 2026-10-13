/**
 * Central data access. All data is bundled with the app, so it works
 * offline and inside sandboxed hosts with no network calls.
 *  - countries.json : 195 countries (facts from the world-countries dataset,
 *                     population from country-json, kid content hand-written)
 *  - world.geo.json : Natural Earth 1:10m borders, India point-of-view edition,
 *                     simplified with mapshaper
 *  - flags.json     : SVG flags from country-flag-icons (render on every OS)
 */
import COUNTRIES from '../data/countries.json'
import GEO from '../data/world.geo.json'
import FLAGS from '../data/flags.json'

export { COUNTRIES, GEO, FLAGS }

export const BY_ID = Object.fromEntries(COUNTRIES.map((c) => [c.id, c]))

/** Continent colours. Kept in sync with tailwind.config.js */
export const CONTINENTS = {
  Africa: { color: '#F6B23E', light: '#FFD27A', key: 'africa' },
  Asia: { color: '#F2685E', light: '#FF9C94', key: 'asia' },
  Europe: { color: '#7B6CF6', light: '#A99FFF', key: 'europe' },
  'North America': { color: '#3CC48A', light: '#7FE3B6', key: 'namerica' },
  'South America': { color: '#FF8FB1', light: '#FFBCD0', key: 'samerica' },
  Oceania: { color: '#2EC4D6', light: '#7BE3EE', key: 'oceania' },
}
export const OTHER_LAND = { color: '#C9D3E6', light: '#E2E8F3' }

/** Small countries get a tappable dot, since their shape is too tiny to hit. */
export const TINY = COUNTRIES.filter((c) => c.tiny)

/** Lookup for "looked after by" names used in the geo data */
const SOV_ALIASES = {
  'United States of America': 'US',
  'United Kingdom': 'GB',
  Netherlands: 'NL',
  'Republic of Serbia': 'RS',
}
const NAME_TO_ID = Object.fromEntries(COUNTRIES.map((c) => [c.name, c.id]))
export const sovereignId = (sov) => SOV_ALIASES[sov] || NAME_TO_ID[sov] || null

/** Colour for a geo feature: continent colour for countries, grey for other places */
export function featureColor(feature, { hover = false, selected = false } = {}) {
  const c = BY_ID[feature.properties.id]
  if (selected) return '#FFC93C'
  if (!c) return hover ? OTHER_LAND.light : OTHER_LAND.color
  const cont = CONTINENTS[c.continent]
  return hover ? cont.light : cont.color
}

/** Countries sorted for search, with a lowercase key */
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const SEARCH_INDEX = COUNTRIES.map((c) => ({ c, key: norm(c.name), cap: norm(c.capital) }))

export function searchCountries(q, limit = 8) {
  const n = norm(q.trim())
  if (!n) return []
  const starts = [], contains = [], capitals = []
  for (const row of SEARCH_INDEX) {
    if (row.key.startsWith(n)) starts.push(row.c)
    else if (row.key.includes(n)) contains.push(row.c)
    else if (row.cap.startsWith(n)) capitals.push(row.c)
  }
  return [...starts, ...contains, ...capitals].slice(0, limit)
}
