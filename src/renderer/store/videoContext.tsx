import { createContext, useContext, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { usePlayerStore } from './playerStore'
import { usePlaylistStore } from './playlistStore'
import { api } from '../api/client'
import type { Video } from '../types'

interface VideoContextValue {
  videoRef: React.RefObject<HTMLVideoElement | null>
  loadVideo: (video: Video) => Promise<void>
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (seconds: number) => void
  seekRelative: (delta: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleFullscreen: () => void
  setPlaybackRate: (r: number) => void
}

const VideoContext = createContext<VideoContextValue | null>(null)

export function VideoProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const store = usePlayerStore()
  const playlist = usePlaylistStore()
  const sessionIdRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const watchedSecondsRef = useRef<number>(0)

  const loadVideo = useCallback(
    async (video: Video) => {
      const el = videoRef.current
      if (!el) return

      // End previous session
      if (sessionIdRef.current !== null) {
        const dur = el.duration || 1
        await api.history.updateSession(
          sessionIdRef.current,
          watchedSecondsRef.current,
          el.currentTime,
          el.currentTime / dur > 0.9
        )
        sessionIdRef.current = null
      }

      lastTimeRef.current = 0
      watchedSecondsRef.current = 0

      store.setCurrentVideo(video)
      el.src = `file://${video.file_path}`
      el.load()

      // Check for resume position
      const stats = await api.history.getStats(video.id)
      if (stats && stats.last_position > 30) {
        el.currentTime = stats.last_position
      }

      await el.play().catch(() => {})
      store.setIsPlaying(true)

      if (video.id > 0) {
        const sessionId = await api.history.startSession(video.id)
        sessionIdRef.current = sessionId
        store.setSessionId(sessionId)
      }
    },
    [store]
  )

  const play = useCallback(() => {
    videoRef.current?.play().catch(() => {})
    store.setIsPlaying(true)
  }, [store])

  const pause = useCallback(() => {
    videoRef.current?.pause()
    store.setIsPlaying(false)
  }, [store])

  const togglePlay = useCallback(() => {
    if (store.isPlaying) pause()
    else play()
  }, [store.isPlaying, play, pause])

  const seek = useCallback((seconds: number) => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = Math.max(0, Math.min(seconds, el.duration || 0))
  }, [])

  const seekRelative = useCallback((delta: number) => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = Math.max(0, Math.min(el.currentTime + delta, el.duration || 0))
  }, [])

  const setVolume = useCallback((v: number) => {
    const el = videoRef.current
    if (!el) return
    el.volume = Math.max(0, Math.min(1, v))
    store.setVolume(el.volume)
  }, [store])

  const toggleMute = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
    store.setIsMuted(el.muted)
  }, [store])

  const toggleFullscreen = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
      store.setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      store.setIsFullscreen(false)
    }
  }, [store])

  const setPlaybackRate = useCallback((rate: number) => {
    const el = videoRef.current
    if (!el) return
    el.playbackRate = rate
    store.setPlaybackRate(rate)
  }, [store])

  // Wire video element events
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onTimeUpdate = () => {
      const current = el.currentTime
      const delta = current - lastTimeRef.current
      if (delta > 0 && delta < 1.5) watchedSecondsRef.current += delta
      lastTimeRef.current = current
      store.setCurrentTime(current)
    }

    const onDurationChange = () => store.setDuration(el.duration || 0)
    const onPlay = () => store.setIsPlaying(true)
    const onPause = () => store.setIsPlaying(false)

    const onEnded = async () => {
      store.setIsPlaying(false)
      if (sessionIdRef.current !== null) {
        await api.history.updateSession(sessionIdRef.current, el.duration, el.duration, true)
        sessionIdRef.current = null
        store.setSessionId(null)
      }
      const next = playlist.next()
      if (next) loadVideo(next)
    }

    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('durationchange', onDurationChange)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('durationchange', onDurationChange)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    }
  }, [store, playlist, loadVideo])

  // Save position periodically
  useEffect(() => {
    const el = videoRef.current
    if (!store.currentVideo || !el) return

    const interval = setInterval(() => {
      if (el.currentTime > 0 && store.currentVideo) {
        api.history.updateLastPosition(store.currentVideo.id, el.currentTime)
        if (sessionIdRef.current !== null) {
          const dur = el.duration || 1
          api.history.updateSession(
            sessionIdRef.current,
            watchedSecondsRef.current,
            el.currentTime,
            el.currentTime / dur > 0.9
          )
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [store.currentVideo])

  const value: VideoContextValue = {
    videoRef,
    loadVideo,
    play,
    pause,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    toggleFullscreen,
    setPlaybackRate
  }

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}

export function useVideoContext(): VideoContextValue {
  const ctx = useContext(VideoContext)
  if (!ctx) throw new Error('useVideoContext must be used within VideoProvider')
  return ctx
}
