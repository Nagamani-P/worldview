/**
 * World View logo: a globe with a flight ring and a little plane.
 * Same artwork as public/logo.svg (favicon and app icons are made from that file).
 * Ids are scoped per instance so several logos on one page do not clash.
 */
import { useId } from 'react'

export default function Logo({ size = 44, className = '', title }) {
  const uid = useId().replace(/:/g, '')
  const clip = `wv-clip-${uid}`
  const sea = `wv-sea-${uid}`
  return (
    <svg viewBox="0 0 128 128" width={size} height={size} className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <clipPath id={clip}><circle cx="62" cy="66" r="42" /></clipPath>
        <radialGradient id={sea} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#5FA0EE" />
          <stop offset="1" stopColor="#2C66BD" />
        </radialGradient>
      </defs>
      <path d="M12 90 A55 22 -22 0 1 113 41" fill="none" stroke="#D99A00" strokeWidth="7" strokeLinecap="round" />
      <circle cx="62" cy="66" r="42" fill={`url(#${sea})`} />
      <g clipPath={`url(#${clip})`}>
        <path d="M30 40c8-8 22-10 28-4 4 4-2 10 2 16 3 5-4 9-9 8-6-1-8 6-14 6-8 0-14-8-12-16 1-4 2-7 5-10z" fill="#3CC48A" />
        <path d="M58 30c10-4 26-2 36 6 6 5 8 12 4 16-4 3-10 0-14 4-3 3-1 8-6 9-6 1-8-6-13-8-5-2-9-8-9-14 0-6 0-11 2-13z" fill="#F2685E" />
        <path d="M60 70c6-3 14-1 17 5 3 7-2 12-1 19 0 6-6 10-11 8-5-3-4-10-8-14-4-5-3-15 3-18z" fill="#F6B23E" />
        <path d="M86 86c5-2 12 0 13 5 1 5-4 7-9 7-5-1-8-3-8-6 0-3 2-5 4-6z" fill="#2EC4D6" />
        <path d="M36 82c4-2 9 1 9 6s-3 13-7 13-6-5-6-9 1-8 4-10z" fill="#FF8FB1" />
        <ellipse cx="44" cy="44" rx="10" ry="5" fill="#fff" opacity="0.28" transform="rotate(-35 44 44)" />
      </g>
      <circle cx="62" cy="66" r="42" fill="none" stroke="#1F2A44" strokeWidth="4" />
      <path d="M12 90 A55 22 -22 0 0 113 41" fill="none" stroke="#1F2A44" strokeWidth="11" strokeLinecap="round" />
      <path d="M12 90 A55 22 -22 0 0 113 41" fill="none" stroke="#FFC93C" strokeWidth="6" strokeLinecap="round" />
      <g transform="translate(110 36) rotate(-38) scale(1.35)">
        <path d="M-10 0 L10 -3 L12 0 L10 3 Z" fill="#fff" stroke="#1F2A44" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M0 -1 L-4 -10 L2 -10 L5 -1 Z M0 1 L-4 10 L2 10 L5 1 Z" fill="#fff" stroke="#1F2A44" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
