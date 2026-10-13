/**
 * Country callout: a name pill with a line pointing down to a dot on the country.
 * Used by the globe (as plain DOM, positioned by globe.gl) and by the flat map
 * (React wrapper below). Styles live in index.css under .wv-callout.
 *
 * Tones:
 *  hover  - light, while the pointer is over a country (desktop)
 *  active - the selected country, with its flag
 *  good   - right answer in the game
 *  bad    - wrong tap in the game ("That's Peru")
 *  reveal - the game shows where the country is
 *  home   - the child's home, start of the flight arc
 */
import { FLAGS } from '../lib/data'

export const TONE_FILL = {
  active: '#FFC93C',
  good: '#36D399',
  bad: '#B8C2D9',
  reveal: '#FFC93C',
  // home keeps its continent colour
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export function calloutHTML({ tone, label, flag, id }) {
  const flagSvg = flag && FLAGS[id] ? `<span class="wv-flag">${FLAGS[id]}</span>` : ''
  const icon = tone === 'home' ? '<span aria-hidden="true">🏠</span>' : tone === 'good' ? '<span aria-hidden="true">⭐</span>' : ''
  return `<span class="wv-dot"></span><span class="wv-stem"></span><span class="wv-pill">${icon}${flagSvg}<span>${esc(label)}</span></span>`
}

export function makeCalloutEl(d) {
  const el = document.createElement('div')
  el.className = `wv-callout wv-${d.tone}`
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = calloutHTML(d)
  return el
}
