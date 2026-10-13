/** First visit only. Optional name, validated as the child types. */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from './Modal'
import HomePicker from './HomePicker'
import Logo from './Logo'

const NAME_OK = /^[\p{L} .'-]*$/u

export default function WelcomeModal() {
  const { dispatch } = useApp()
  const [name, setName] = useState('')
  const trimmed = name.trim()
  const error = !NAME_OK.test(name) ? 'Use letters only, please.' : trimmed.length > 20 ? 'That name is a bit long. Try 20 letters or fewer.' : ''

  const start = (e) => {
    e?.preventDefault()
    if (error) return
    dispatch({ type: 'welcome', name: trimmed })
  }

  return (
    <Modal label="Welcome to World View" onClose={() => dispatch({ type: 'welcome' })}>
      <form onSubmit={start} className="p-6 md:p-7">
        <Logo size={60} />
        <h2 className="mt-3 font-display text-2xl font-black leading-tight text-ink dark:text-white">Hello, explorer!</h2>
        <p className="mt-2 text-lg text-ink-soft dark:text-white/80">There are 195 countries on our planet. Let's go and meet them.</p>

        <ul className="mt-4 grid grid-cols-3 gap-2">
          {[
            ['👆', 'Spin and tap'],
            ['🎯', 'Play Find it!'],
            ['🛂', 'Collect stamps'],
          ].map(([icon, text]) => (
            <li key={text} className="flex flex-col items-center gap-1 rounded-2xl bg-sky-mist px-2 py-3 text-center text-sm font-extrabold leading-tight text-ink dark:bg-night-deep/60 dark:text-white">
              <span aria-hidden className="text-3xl">{icon}</span>{text}
            </li>
          ))}
        </ul>

        <label htmlFor="explorer-name" className="mt-4 block font-display text-base font-extrabold text-ink dark:text-white">
          What's your name? <span className="font-body font-bold text-ink-soft dark:text-white/60">(you can skip this)</span>
        </label>
        <input
          id="explorer-name"
          data-autofocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby="name-help"
          placeholder="Your name"
          className={`mt-2 h-14 w-full rounded-2xl border-2 bg-white px-4 text-lg font-bold text-ink outline-none transition focus:border-sun dark:bg-night-deep dark:text-white ${error ? 'border-asia' : 'border-ink/15 dark:border-night-line'}`}
        />
        <p id="name-help" aria-live="polite" className={`mt-1 min-h-[1.25rem] text-sm font-bold ${error ? 'text-asia' : 'text-namerica'}`}>
          {error || (trimmed ? `Nice to meet you, ${trimmed}!` : '')}
        </p>

        <p className="mt-1 block font-display text-base font-extrabold text-ink dark:text-white">Where do you live? <span className="font-body font-bold text-ink-soft dark:text-white/60">(for “how far from home”)</span></p>
        <div className="mt-2"><HomePicker /></div>

        <button type="submit" disabled={!!error} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sun font-display text-lg font-black text-ink shadow-pop transition hover:scale-[1.02] hover:bg-sun-dark disabled:opacity-50 disabled:hover:scale-100">
          Let's explore
        </button>
      </form>
    </Modal>
  )
}
