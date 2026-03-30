import { contextBridge, ipcRenderer } from 'electron'
import type { Video, Tag, Playlist, VideoStats, VideoFilter, VideoFile } from '../renderer/types'

const api = {
  videos: {
    getAll: (filter?: VideoFilter): Promise<Video[]> =>
      ipcRenderer.invoke('db:videos:getAll', filter ?? {}),
    getById: (id: number): Promise<Video | null> => ipcRenderer.invoke('db:videos:getById', id),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:videos:delete', id),
    updateDuration: (id: number, duration: number): Promise<void> =>
      ipcRenderer.invoke('db:videos:updateDuration', id, duration)
  },

  tags: {
    getAll: (): Promise<Tag[]> => ipcRenderer.invoke('db:tags:getAll'),
    getByVideo: (videoId: number): Promise<Tag[]> =>
      ipcRenderer.invoke('db:tags:getByVideo', videoId),
    create: (name: string, color: string): Promise<Tag> =>
      ipcRenderer.invoke('db:tags:create', name, color),
    update: (id: number, name: string, color: string): Promise<void> =>
      ipcRenderer.invoke('db:tags:update', id, name, color),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:tags:delete', id),
    setVideoTags: (videoId: number, tagIds: number[]): Promise<void> =>
      ipcRenderer.invoke('db:tags:setVideoTags', videoId, tagIds)
  },

  playlists: {
    getAll: (): Promise<Playlist[]> => ipcRenderer.invoke('db:playlists:getAll'),
    getVideos: (playlistId: number): Promise<Video[]> =>
      ipcRenderer.invoke('db:playlists:getVideos', playlistId),
    create: (name: string): Promise<Playlist> => ipcRenderer.invoke('db:playlists:create', name),
    rename: (id: number, name: string): Promise<void> =>
      ipcRenderer.invoke('db:playlists:rename', id, name),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:playlists:delete', id),
    addVideo: (playlistId: number, videoId: number): Promise<void> =>
      ipcRenderer.invoke('db:playlists:addVideo', playlistId, videoId),
    addVideos: (playlistId: number, videoIds: number[]): Promise<void> =>
      ipcRenderer.invoke('db:playlists:addVideos', playlistId, videoIds),
    removeVideo: (playlistId: number, videoId: number): Promise<void> =>
      ipcRenderer.invoke('db:playlists:removeVideo', playlistId, videoId),
    reorder: (playlistId: number, videoIds: number[]): Promise<void> =>
      ipcRenderer.invoke('db:playlists:reorder', playlistId, videoIds),
    clearVideos: (playlistId: number): Promise<void> =>
      ipcRenderer.invoke('db:playlists:clearVideos', playlistId)
  },

  history: {
    startSession: (videoId: number): Promise<number> =>
      ipcRenderer.invoke('db:history:startSession', videoId),
    updateSession: (
      sessionId: number,
      watchedSeconds: number,
      lastPosition: number,
      completed: boolean
    ): Promise<void> =>
      ipcRenderer.invoke('db:history:updateSession', sessionId, watchedSeconds, lastPosition, completed),
    getStats: (videoId: number): Promise<VideoStats | null> =>
      ipcRenderer.invoke('db:history:getStats', videoId),
    updateLastPosition: (videoId: number, position: number): Promise<void> =>
      ipcRenderer.invoke('db:history:updateLastPosition', videoId, position),
    getRecentlyPlayed: (limit?: number): Promise<{ video_id: number; last_played_at: number }[]> =>
      ipcRenderer.invoke('db:history:getRecentlyPlayed', limit ?? 20)
  },

  fs: {
    openFolderDialog: (): Promise<string | null> => ipcRenderer.invoke('dialog:openFolder'),
    openFilesDialog: (): Promise<string[]> => ipcRenderer.invoke('dialog:openFiles'),
    scanFolder: (folderPath: string): Promise<VideoFile[]> =>
      ipcRenderer.invoke('fs:scanFolder', folderPath),
    addFiles: (filePaths: string[]): Promise<VideoFile[]> =>
      ipcRenderer.invoke('fs:addFiles', filePaths)
  },

  events: {
    on: (channel: string, callback: (...args: unknown[]) => void): void => {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    },
    off: (channel: string, callback: (...args: unknown[]) => void): void => {
      ipcRenderer.removeListener(channel, (_event, ...args) => callback(...args))
    }
  }
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
