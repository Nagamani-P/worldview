/** Read-aloud using the browser's built-in speech. Falls back silently if missing. */
import { useCallback, useEffect, useState } from 'react'

export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.9 // a little slower for young listeners
      u.pitch = 1.05
      const voices = window.speechSynthesis.getVoices()
      const voice =
        voices.find((v) => /en-IN/i.test(v.lang)) ||
        voices.find((v) => /en-GB|en-US/i.test(v.lang))
      if (voice) u.voice = voice
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(u)
    },
    [supported]
  )

  useEffect(() => stop, [stop]) // stop talking when the component unmounts
  return { supported, speaking, speak, stop }
}
