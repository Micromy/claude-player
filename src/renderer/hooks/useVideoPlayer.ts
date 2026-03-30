import { useRef, useEffect, useCallback } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { usePlaylistStore } from '../store/playlistStore'
import { api } from '../api/client'
import type { Video } from '../types'

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const store = usePlayerStore()
  const playlist = usePlaylistStore()

  const loadVideo = useCallback(
    async (video: Video) => {
      const el = videoRef.current
      if (!el) return

      // End previous session
      if (store.sessionId !== null && store.currentVideo) {
        const watched = el.currentTime
        const dur = el.duration || 1
        await api.history.updateSession(
          store.sessionId,
          watched,
          el.currentTime,
          el.currentTime / dur > 0.9
        )
      }

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

      const sessionId = await api.history.startSession(video.id)
      store.setSessionId(sessionId)
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

  const seek = useCallback(
    (seconds: number) => {
      const el = videoRef.current
      if (!el) return
      el.currentTime = Math.max(0, Math.min(seconds, el.duration || 0))
    },
    []
  )

  const seekRelative = useCallback(
    (delta: number) => {
      const el = videoRef.current
      if (!el) return
      seek(el.currentTime + delta)
    },
    [seek]
  )

  const setVolume = useCallback(
    (v: number) => {
      const el = videoRef.current
      if (!el) return
      el.volume = Math.max(0, Math.min(1, v))
      store.setVolume(el.volume)
    },
    [store]
  )

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

  const setPlaybackRate = useCallback(
    (rate: number) => {
      const el = videoRef.current
      if (!el) return
      el.playbackRate = rate
      store.setPlaybackRate(rate)
    },
    [store]
  )

  // Wire video element events
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onTimeUpdate = () => store.setCurrentTime(el.currentTime)
    const onDurationChange = () => store.setDuration(el.duration || 0)
    const onPlay = () => store.setIsPlaying(true)
    const onPause = () => store.setIsPlaying(false)
    const onEnded = async () => {
      store.setIsPlaying(false)

      if (store.sessionId !== null && store.currentVideo) {
        await api.history.updateSession(
          store.sessionId,
          el.duration,
          el.duration,
          true
        )
        store.setSessionId(null)
      }

      const next = playlist.next()
      if (next) {
        loadVideo(next)
      }
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
      if (el.currentTime > 0) {
        api.history.updateLastPosition(store.currentVideo!.id, el.currentTime)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [store.currentVideo])

  return {
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
}
