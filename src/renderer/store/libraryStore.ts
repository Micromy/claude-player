import { create } from 'zustand'
import { api } from '../api/client'
import type { Video, Tag, VideoFilter } from '../types'

interface LibraryState {
  videos: Video[]
  tags: Tag[]
  filter: VideoFilter
  isLoading: boolean

  loadVideos: (filter?: VideoFilter) => Promise<void>
  loadTags: () => Promise<void>
  setFilter: (filter: Partial<VideoFilter>) => void
  refreshAll: () => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  videos: [],
  tags: [],
  filter: { sortBy: 'title', sortOrder: 'ASC' },
  isLoading: false,

  loadVideos: async (filter) => {
    set({ isLoading: true })
    const f = filter ?? get().filter
    const videos = await api.videos.getAll(f)
    set({ videos, isLoading: false })
  },

  loadTags: async () => {
    const tags = await api.tags.getAll()
    set({ tags })
  },

  setFilter: (partial) => {
    const filter = { ...get().filter, ...partial }
    set({ filter })
    get().loadVideos(filter)
  },

  refreshAll: async () => {
    await Promise.all([get().loadVideos(), get().loadTags()])
  }
}))
