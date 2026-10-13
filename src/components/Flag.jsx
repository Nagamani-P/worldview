/** SVG flag from the bundled set. Local, trusted markup, so innerHTML is safe here. */
import { FLAGS } from '../lib/data'

export default function Flag({ id, className = '', title }) {
  const svg = FLAGS[id]
  if (!svg) return null
  return (
    <span
      role="img"
      aria-label={title ? `Flag of ${title}` : undefined}
      aria-hidden={title ? undefined : true}
      className={`inline-block overflow-hidden [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
