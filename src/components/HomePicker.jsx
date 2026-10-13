/** Shows the child's home country, with a search to change it. */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { BY_ID } from '../lib/data'
import Flag from './Flag'
import Search from './Search'

export default function HomePicker({ tone = 'light' }) {
  const { state, dispatch } = useApp()
  const [editing, setEditing] = useState(!state.home)
  const home = state.home && BY_ID[state.home]
  const onDark = tone === 'dark'

  if (editing) {
    return (
      <div className="animate-fade">
        <Search
          autoFocus={!!state.home}
          placeholder="Type your country"
          onPick={(id) => { dispatch({ type: 'setHome', id }); setEditing(false) }}
          onDone={() => home && setEditing(false)}
        />
      </div>
    )
  }
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${onDark ? 'bg-white/10' : 'bg-sky-mist dark:bg-night-deep/60'}`}>
      <span aria-hidden className="text-xl">🏠</span>
      <Flag id={home.id} title={home.name} className="h-7 w-10 rounded" />
      <span className={`flex-1 font-bold ${onDark ? 'text-white' : 'text-ink dark:text-white'}`}>{home.name}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`h-11 rounded-xl px-3 text-sm font-extrabold underline-offset-4 hover:underline ${onDark ? 'text-sun' : 'text-ocean dark:text-sun'}`}
      >
        Change
      </button>
    </div>
  )
}
