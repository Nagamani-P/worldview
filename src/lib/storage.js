/** Safe localStorage helpers. Storage can be blocked (private mode, sandboxes),
 *  so every call is wrapped and the app keeps working without it. */
const KEY = 'worldview:v1'

export function loadState() {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable: progress lasts for this visit only */
  }
}
