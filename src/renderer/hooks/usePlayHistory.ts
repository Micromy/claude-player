import { useRef, useEffect } from 'react'
import { api } from '../api/client'
import { usePlayerStore } from '../store/playerStore'

export function usePlayHistory(videoRef: React.RefObject<HTMLVideoElement | null>): void {
  const store = usePlayerStore()
  const lastTimeRef = useRef<number>(0)
  const watchedSecondsRef = useRef<number>(0)

  // Track actual watched time (ignoring seeks)
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onTimeUpdate = () => {
      const current = el.currentTime
      const delta = current - lastTimeRef.current

      // Only count forward movement < 1.5s (normal playback)
      if (delta > 0 && delta < 1.5) {
        watchedSecondsRef.current += delta
      }
      lastTimeRef.current = current
    }

    el.addEventListener('timeupdate', onTimeUpdate)
    return () => el.removeEventListener('timeupdate', onTimeUpdate)
  }, [videoRef])

  // Reset on new video
  useEffect(() => {
    lastTimeRef.current = 0
    watchedSecondsRef.current = 0
  }, [store.currentVideo?.id])

  // Flush to DB every 5s
  useEffect(() => {
    if (!store.sessionId || !store.currentVideo) return
    const el = videoRef.current
    if (!el) return

    const interval = setInterval(() => {
      if (store.sessionId !== null) {
        const dur = el.duration || 1
        api.history.updateSession(
          store.sessionId,
          watchedSecondsRef.current,
          el.currentTime,
          el.currentTime / dur > 0.9
        )
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [store.sessionId, store.currentVideo, videoRef])
}
