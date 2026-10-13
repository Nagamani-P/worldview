/** Animal / food tile. Shows a Wikipedia photo when one is found, otherwise a big emoji. */
import { useState } from 'react'
import { useWikiImage } from '../hooks/useWikiImage'

// Short dish names that point to the wrong Wikipedia page. Emoji only for these.
const NO_PHOTO = new Set(['Papa', 'Pâte', 'Pom', 'Tô', 'Boule', 'Poi', 'Kisra', 'Mumu', 'Pulaka', 'Lu pulu', 'Ikan sabuko', 'Saltah', 'Pepperpot', 'Doubles', 'Oil down', 'Pasta', 'Salmon', 'Kebab', 'Pig', 'Cow', 'Bull', 'Dove', 'Eagle', 'Horse', 'Reef fish', 'Mediterranean fish'])

export default function PhotoTile({ label, name, emoji, tint }) {
  const skip = NO_PHOTO.has(name)
  const { status, url } = useWikiImage(skip ? null : name)
  const [broken, setBroken] = useState(false)
  const showPhoto = !skip && url && !broken
  const loading = !skip && status === 'loading'

  return (
    <figure className="overflow-hidden rounded-3xl bg-white shadow-pop dark:bg-night-card">
      <div className="relative aspect-[4/3] w-full" style={{ background: tint }}>
        {loading && <div className="absolute inset-0 animate-pulse bg-white/40" aria-hidden />}
        {showPhoto ? (
          <img src={url} alt={name} loading="lazy" onError={() => setBroken(true)} className="h-full w-full animate-fade object-cover" />
        ) : (
          !loading && (
            <span className="absolute inset-0 grid animate-fade place-items-center text-[4.5rem] leading-none" aria-hidden>
              {emoji}
            </span>
          )
        )}
      </div>
      <figcaption className="px-4 py-3">
        <span className="block text-sm font-bold text-ink-soft dark:text-white/60">{label}</span>
        <span className="block font-display text-lg font-extrabold leading-tight text-ink dark:text-white">{name}</span>
      </figcaption>
    </figure>
  )
}
