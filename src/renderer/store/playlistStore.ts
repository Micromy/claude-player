import { create } from 'zustand'
import type { Video } from '../types'

interface PlaylistState {
  items: Video[]
  currentIndex: number

  setItems: (videos: Video[]) => void
  addVideo: (video: Video) => void
  addVideos: (videos: Video[]) => void
  removeAt: (index: number) => void
  moveItem: (from: number, to: number) => void
  next: () => Video | null
  prev: () => Video | null
  jumpTo: (index: number) => Video | null
  clear: () => void
  shuffle: () => void
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  items: [],
  currentIndex: -1,

  setItems: (videos) => set({ items: videos, currentIndex: videos.length > 0 ? 0 : -1 }),

  addVideo: (video) =>
    set((s) => {
      const exists = s.items.some((v) => v.id === video.id)
      if (exists) return s
      return {
        items: [...s.items, video],
        currentIndex: s.currentIndex === -1 ? 0 : s.currentIndex
      }
    }),

  addVideos: (videos) =>
    set((s) => {
      const existingIds = new Set(s.items.map((v) => v.id))
      const newVideos = videos.filter((v) => !existingIds.has(v.id))
      if (newVideos.length === 0) return s
      return {
        items: [...s.items, ...newVideos],
        currentIndex: s.currentIndex === -1 ? 0 : s.currentIndex
      }
    }),

  removeAt: (index) =>
    set((s) => {
      const items = s.items.filter((_, i) => i !== index)
      let currentIndex = s.currentIndex
      if (index < currentIndex) currentIndex--
      else if (index === currentIndex) currentIndex = Math.min(currentIndex, items.length - 1)
      return { items, currentIndex }
    }),

  moveItem: (from, to) =>
    set((s) => {
      const items = [...s.items]
      const [moved] = items.splice(from, 1)
      items.splice(to, 0, moved)
      let currentIndex = s.currentIndex
      if (s.currentIndex === from) currentIndex = to
      else if (from < s.currentIndex && to >= s.currentIndex) currentIndex--
      else if (from > s.currentIndex && to <= s.currentIndex) currentIndex++
      return { items, currentIndex }
    }),

  next: () => {
    const { items, currentIndex } = get()
    const nextIndex = currentIndex + 1
    if (nextIndex >= items.length) return null
    set({ currentIndex: nextIndex })
    return items[nextIndex]
  },

  prev: () => {
    const { items, currentIndex } = get()
    const prevIndex = currentIndex - 1
    if (prevIndex < 0) return null
    set({ currentIndex: prevIndex })
    return items[prevIndex]
  },

  jumpTo: (index) => {
    const { items } = get()
    if (index < 0 || index >= items.length) return null
    set({ currentIndex: index })
    return items[index]
  },

  clear: () => set({ items: [], currentIndex: -1 }),

  shuffle: () =>
    set((s) => {
      const items = [...s.items]
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[items[i], items[j]] = [items[j], items[i]]
      }
      return { items, currentIndex: 0 }
    })
}))
