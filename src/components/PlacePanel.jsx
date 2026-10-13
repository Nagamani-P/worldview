/** Shown for land that is not one of the 195 countries (Antarctica, Greenland, islands...). */
import { BY_ID, sovereignId } from '../lib/data'
import Sheet from './Sheet'
import Flag from './Flag'

export default function PlacePanel({ feature, onClose, onPick }) {
  const { name, sov, id } = feature.properties
  const isAntarctica = id === 'AQ'
  const sid = sov && sov !== name ? sovereignId(sov) : null
  const owner = sid && BY_ID[sid]

  return (
    <Sheet label={`About ${name}`} onClose={onClose} accent="#C9D3E6">
      <div className="px-5 pb-8 pt-4 md:px-6">
        <div className="text-[4rem] leading-none" aria-hidden>{isAntarctica ? '🐧' : '🏝️'}</div>
        <h2 className="mt-3 pr-12 font-display text-xl font-black text-ink dark:text-white">{name}</h2>
        <p className="mt-3 text-lg text-ink dark:text-white/90">
          {isAntarctica
            ? 'Antarctica is the coldest place on Earth. It is covered in ice, and penguins live here. No country owns it.'
            : owner
              ? `${name} is a special place looked after by ${owner.name}.`
              : `${name} is a special place. It is not one of the 195 countries in this app.`}
        </p>
        {owner && (
          <button
            onClick={() => onPick(owner.id)}
            className="mt-6 flex h-14 items-center gap-3 rounded-2xl bg-sun px-5 font-display text-lg font-black text-ink shadow-pop transition hover:scale-[1.02] hover:bg-sun-dark"
          >
            <Flag id={owner.id} className="h-7 w-10 rounded" /> Visit {owner.name}
          </button>
        )}
      </div>
    </Sheet>
  )
}
