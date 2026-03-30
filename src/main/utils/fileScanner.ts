import { readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'
import type { BrowserWindow } from 'electron'
import type { VideoFile } from '../../renderer/types'

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.avi', '.webm', '.mov', '.m4v', '.flv', '.wmv', '.ts', '.m2ts'])

export function scanDirectory(
  rootPath: string,
  win?: BrowserWindow
): VideoFile[] {
  const results: VideoFile[] = []
  const queue: string[] = [rootPath]

  while (queue.length > 0) {
    const dir = queue.shift()!
    let entries: ReturnType<typeof readdirSync>

    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        queue.push(fullPath)
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (VIDEO_EXTENSIONS.has(ext)) {
          let fileSize = 0
          try {
            fileSize = statSync(fullPath).size
          } catch {
            // ignore
          }
          results.push({
            file_path: fullPath,
            title: basename(entry.name, ext),
            file_size: fileSize
          })

          if (win && results.length % 100 === 0) {
            win.webContents.send('scan:progress', { found: results.length })
          }
        }
      }
    }
  }

  if (win) {
    win.webContents.send('scan:progress', { found: results.length, done: true })
  }

  return results
}
