import { ipcMain, dialog, BrowserWindow } from 'electron'
import { scanDirectory } from '../utils/fileScanner'
import { VideoRepository } from '../database/repositories/VideoRepository'
import type { VideoFile } from '../../renderer/types'

export function registerFilesystemHandlers(win: BrowserWindow): void {
  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:openFiles', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Video Files',
          extensions: ['mp4', 'mkv', 'avi', 'webm', 'mov', 'm4v', 'flv', 'wmv', 'ts', 'm2ts']
        }
      ]
    })
    if (result.canceled) return []
    return result.filePaths
  })

  ipcMain.handle('fs:scanFolder', async (_event, folderPath: string) => {
    const files: VideoFile[] = scanDirectory(folderPath, win)

    // Batch upsert in chunks
    const CHUNK_SIZE = 500
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      VideoRepository.upsertMany(files.slice(i, i + CHUNK_SIZE))
    }

    return files
  })

  ipcMain.handle('fs:addFiles', async (_event, filePaths: string[]) => {
    const files: VideoFile[] = filePaths.map((fp) => {
      const name = fp.split(/[\\/]/).pop() ?? fp
      const title = name.replace(/\.[^.]+$/, '')
      return { file_path: fp, title, file_size: 0 }
    })
    VideoRepository.upsertMany(files)
    return files
  })
}
