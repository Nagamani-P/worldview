/** Kid-friendly number phrasing. Big exact numbers mean little to a 7-year-old. */

export function peopleText(pop) {
  if (!pop) return 'Not sure'
  if (pop >= 1e9) return `About ${(pop / 1e9).toFixed(1).replace('.0', '')} billion`
  if (pop >= 1e7) return `About ${Math.round(pop / 1e6)} million`
  if (pop >= 1e6) return `About ${(pop / 1e6).toFixed(1).replace('.0', '')} million`
  if (pop >= 1e4) return `About ${Math.round(pop / 1e3).toLocaleString('en')} thousand`
  return `About ${(Math.round(pop / 100) * 100).toLocaleString('en')}`
}

/** A comparison a child can picture: how many school classes of 30 */
export function peopleHint(pop) {
  if (!pop) return ''
  if (pop < 100000) return 'That could fit in one big football stadium!'
  if (pop < 1e6) return 'About as many as one big city.'
  if (pop < 3e7) return 'Lots of cities full of people.'
  if (pop < 3e8) return 'So many people! One of the busy countries.'
  return 'One of the countries with the most people on Earth!'
}

/** Size from 1 to 5, on a log scale from Vatican (0.44 km²) to Russia (17 million km²) */
export function sizeLevel(area) {
  if (!area) return 1
  const l = Math.log10(Math.max(area, 1))
  return Math.min(5, Math.max(1, Math.round(l / 1.45)))
}
export const SIZE_WORDS = ['', 'Tiny', 'Small', 'Medium', 'Big', 'Huge']

export const listText = (arr) =>
  arr.length <= 1 ? arr[0] || '' : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`

/** "About 5,800 km" style rounding, and a plane-time a child can picture */
export function distanceText(km) {
  if (km == null) return ''
  const r = km < 1000 ? Math.max(50, Math.round(km / 50) * 50) : Math.round(km / 100) * 100
  return `About ${r.toLocaleString('en')} km`
}
export function flightText(km) {
  if (km == null) return ''
  const hours = km / 800 + 0.5 // cruise ~800 km/h, plus take-off and landing
  if (hours < 1.5) return 'About 1 hour by plane'
  if (hours < 24) return `About ${Math.round(hours)} hours by plane`
  return 'More than a whole day by plane!'
}
