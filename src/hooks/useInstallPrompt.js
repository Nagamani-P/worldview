/**
 * "Install app" support. Chrome/Edge/Android fire beforeinstallprompt when the
 * site can be installed; we keep the event and show our own button.
 * iOS Safari has no prompt: people use Share > Add to Home Screen.
 */
import { useCallback, useEffect, useState } from 'react'

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export function useInstallPrompt() {
  const [evt, setEvt] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setEvt(e) }
    const onInstalled = () => { setInstalled(true); setEvt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!evt) return
    evt.prompt()
    await evt.userChoice.catch(() => null)
    setEvt(null)
  }, [evt])

  return { canInstall: !!evt && !installed, install }
}
