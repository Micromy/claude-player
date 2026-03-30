import { ipcMain } from 'electron'
import { VideoRepository } from '../database/repositories/VideoRepository'
import { TagRepository } from '../database/repositories/TagRepository'
import { PlaylistRepository } from '../database/repositories/PlaylistRepository'
import { PlayHistoryRepository } from '../database/repositories/PlayHistoryRepository'
import type { VideoFilter } from '../../renderer/types'

export function registerDatabaseHandlers(): void {
  // Videos
  ipcMain.handle('db:videos:getAll', (_e, filter: VideoFilter) => VideoRepository.findAll(filter))
  ipcMain.handle('db:videos:getById', (_e, id: number) => VideoRepository.findById(id))
  ipcMain.handle('db:videos:delete', (_e, id: number) => VideoRepository.delete(id))
  ipcMain.handle('db:videos:updateDuration', (_e, id: number, duration: number) =>
    VideoRepository.updateDuration(id, duration)
  )

  // Tags
  ipcMain.handle('db:tags:getAll', () => TagRepository.findAll())
  ipcMain.handle('db:tags:getByVideo', (_e, videoId: number) => TagRepository.findByVideo(videoId))
  ipcMain.handle('db:tags:create', (_e, name: string, color: string) =>
    TagRepository.create(name, color)
  )
  ipcMain.handle('db:tags:update', (_e, id: number, name: string, color: string) =>
    TagRepository.update(id, name, color)
  )
  ipcMain.handle('db:tags:delete', (_e, id: number) => TagRepository.delete(id))
  ipcMain.handle('db:tags:setVideoTags', (_e, videoId: number, tagIds: number[]) =>
    TagRepository.setVideoTags(videoId, tagIds)
  )

  // Playlists
  ipcMain.handle('db:playlists:getAll', () => PlaylistRepository.findAll())
  ipcMain.handle('db:playlists:getVideos', (_e, playlistId: number) =>
    PlaylistRepository.getVideos(playlistId)
  )
  ipcMain.handle('db:playlists:create', (_e, name: string) => PlaylistRepository.create(name))
  ipcMain.handle('db:playlists:rename', (_e, id: number, name: string) =>
    PlaylistRepository.rename(id, name)
  )
  ipcMain.handle('db:playlists:delete', (_e, id: number) => PlaylistRepository.delete(id))
  ipcMain.handle('db:playlists:addVideo', (_e, playlistId: number, videoId: number) =>
    PlaylistRepository.addVideo(playlistId, videoId)
  )
  ipcMain.handle('db:playlists:addVideos', (_e, playlistId: number, videoIds: number[]) =>
    PlaylistRepository.addVideos(playlistId, videoIds)
  )
  ipcMain.handle('db:playlists:removeVideo', (_e, playlistId: number, videoId: number) =>
    PlaylistRepository.removeVideo(playlistId, videoId)
  )
  ipcMain.handle('db:playlists:reorder', (_e, playlistId: number, videoIds: number[]) =>
    PlaylistRepository.reorder(playlistId, videoIds)
  )
  ipcMain.handle('db:playlists:clearVideos', (_e, playlistId: number) =>
    PlaylistRepository.clearVideos(playlistId)
  )

  // Play History
  ipcMain.handle('db:history:startSession', (_e, videoId: number) =>
    PlayHistoryRepository.startSession(videoId)
  )
  ipcMain.handle(
    'db:history:updateSession',
    (_e, sessionId: number, watchedSeconds: number, lastPosition: number, completed: boolean) =>
      PlayHistoryRepository.updateSession(sessionId, watchedSeconds, lastPosition, completed)
  )
  ipcMain.handle('db:history:getStats', (_e, videoId: number) =>
    PlayHistoryRepository.getStats(videoId)
  )
  ipcMain.handle('db:history:updateLastPosition', (_e, videoId: number, position: number) =>
    PlayHistoryRepository.updateLastPosition(videoId, position)
  )
  ipcMain.handle('db:history:getRecentlyPlayed', (_e, limit: number) =>
    PlayHistoryRepository.getRecentlyPlayed(limit)
  )
}
