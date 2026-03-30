import { useEffect } from 'react'

interface Handlers {
  togglePlay: () => void
  seekRelative: (delta: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleFullscreen: () => void
  volume: number
}

export function useKeyboardShortcuts(handlers: Handlers): void {
  const { togglePlay, seekRelative, setVolume, toggleMute, toggleFullscreen, volume } = handlers

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          seekRelative(e.shiftKey ? 30 : 10)
          break
        case 'ArrowLeft':
          e.preventDefault()
          seekRelative(e.shiftKey ? -30 : -10)
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
          break
        case 'm':
        case 'M':
          toggleMute()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePlay, seekRelative, setVolume, toggleMute, toggleFullscreen, volume])
}
