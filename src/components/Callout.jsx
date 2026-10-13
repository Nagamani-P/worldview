/** React version of the callout for the flat map. Positioned at (x, y) in pixels. */
import { calloutHTML } from './callout'

export default function Callout({ x, y, ...d }) {
  return (
    <div
      className={`wv-callout wv-${d.tone}`}
      style={{ position: 'absolute', left: x, top: y }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: calloutHTML(d) }}
    />
  )
}
