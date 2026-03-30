import { create } from 'zustand'
import type { Video } from '../types'

interface PlayerState {
  currentVideo: Video | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  playbackRate: number
  sessionId: number | null

  setCurrentVideo: (video: Video | null) => void
  setIsPlaying: (v: boolean) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setVolume: (v: number) => void
  setIsMuted: (v: boolean) => void
  setIsFullscreen: (v: boolean) => void
  setPlaybackRate: (r: number) => void
  setSessionId: (id: number | null) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentVideo: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  playbackRate: 1,
  sessionId: null,

  setCurrentVideo: (video) => set({ currentVideo: video, currentTime: 0, duration: 0, isPlaying: false }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => set({ volume: v }),
  setIsMuted: (v) => set({ isMuted: v }),
  setIsFullscreen: (v) => set({ isFullscreen: v }),
  setPlaybackRate: (r) => set({ playbackRate: r }),
  setSessionId: (id) => set({ sessionId: id })
}))
