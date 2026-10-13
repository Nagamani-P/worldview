/**
 * Fetches a photo from Wikipedia for an exact article title.
 * Rules to avoid wrong pictures:
 *  - exact title only, no search
 *  - skip disambiguation pages
 *  - if anything fails (offline, blocked, no image) return null and the UI shows the emoji
 */
import { useEffect, useState } from 'react'

const cache = new Map()

export function useWikiImage(title) {
  const [state, setState] = useState(() => (cache.has(title) ? { status: 'done', url: cache.get(title) } : { status: 'loading', url: null }))

  useEffect(() => {
    if (!title) return
    if (cache.has(title)) {
      setState({ status: 'done', url: cache.get(title) })
      return
    }
    let alive = true
    const ctrl = new AbortController()
    setState({ status: 'loading', url: null })
    const timer = setTimeout(() => ctrl.abort(), 6000)
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const url = j && j.type !== 'disambiguation' ? j.thumbnail?.source || null : null
        cache.set(title, url)
        if (alive) setState({ status: 'done', url })
      })
      .catch(() => {
        if (alive) setState({ status: 'done', url: null })
      })
      .finally(() => clearTimeout(timer))
    return () => {
      alive = false
      ctrl.abort()
    }
  }, [title])

  return state
}
