import { useState, useCallback } from 'react'
import { api } from '../../api/client'
import { usePlaylistStore } from '../../store/playlistStore'
import { useLibraryStore } from '../../store/libraryStore'
import type { VideoFile } from '../../types'

interface Props {
  onPlayVideo: (filePath: string, title: string) => void
}

export function FileBrowser({ onPlayVideo }: Props) {
  const [scannedFiles, setScannedFiles] = useState<VideoFile[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const playlist = usePlaylistStore()
  const library = useLibraryStore()

  const handleSelectFolder = useCallback(async () => {
    const folder = await api.fs.openFolderDialog()
    if (!folder) return

    setCurrentFolder(folder)
    setIsScanning(true)
    setScanProgress(0)
    setScannedFiles([])

    // Listen for scan progress
    const handler = (data: { found: number; done?: boolean }) => {
      setScanProgress(data.found)
    }
    api.events.on('scan:progress', handler)

    const files = await api.fs.scanFolder(folder)
    api.events.off('scan:progress', handler)

    setScannedFiles(files)
    setIsScanning(false)
    library.refreshAll()
  }, [library])

  const handleOpenFiles = useCallback(async () => {
    const filePaths = await api.fs.openFilesDialog()
    if (filePaths.length === 0) return

    const added = await api.fs.addFiles(filePaths)
    setScannedFiles((prev) => {
      const existingPaths = new Set(prev.map((f) => f.file_path))
      return [...prev, ...added.filter((f) => !existingPaths.has(f.file_path))]
    })
    library.refreshAll()
  }, [library])

  const handleAddAllToPlaylist = useCallback(async () => {
    const videos = await api.videos.getAll()
    // Filter to only scanned files
    const scannedPaths = new Set(scannedFiles.map((f) => f.file_path))
    const toAdd = videos.filter((v) => scannedPaths.has(v.file_path))
    playlist.addVideos(toAdd)
  }, [scannedFiles, playlist])

  const handleAddToPlaylist = useCallback(
    async (file: VideoFile) => {
      const videos = await api.videos.getAll()
      const video = videos.find((v) => v.file_path === file.file_path)
      if (video) playlist.addVideo(video)
    },
    [playlist]
  )

  const formatSize = (bytes: number) => {
    if (bytes === 0) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 shrink-0">
        <button
          onClick={handleSelectFolder}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
          </svg>
          폴더 선택
        </button>

        <button
          onClick={handleOpenFiles}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-xs rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
          </svg>
          파일 열기
        </button>

        {scannedFiles.length > 0 && (
          <button
            onClick={handleAddAllToPlaylist}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            전체 플레이리스트 추가 ({scannedFiles.length})
          </button>
        )}
      </div>

      {/* Current folder */}
      {currentFolder && (
        <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
          <p className="text-xs text-gray-500 truncate">
            <span className="text-gray-400">📁</span> {currentFolder}
          </p>
        </div>
      )}

      {/* Scan progress */}
      {isScanning && (
        <div className="px-4 py-2 bg-indigo-900/20 border-b border-indigo-900/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-indigo-300">스캔 중... {scanProgress}개 발견</span>
          </div>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {scannedFiles.length === 0 && !isScanning ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm text-center">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
            </svg>
            <p>폴더를 선택하거나 파일을 열어주세요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {scannedFiles.map((file) => (
              <div
                key={file.file_path}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 group cursor-pointer"
                onDoubleClick={() => onPlayVideo(file.file_path, file.title)}
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{file.title}</p>
                  <p className="text-xs text-gray-600 truncate">{file.file_path}</p>
                </div>
                <span className="text-xs text-gray-600 shrink-0">{formatSize(file.file_size)}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPlayVideo(file.file_path, file.title)
                    }}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                    title="재생"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToPlaylist(file)
                    }}
                    className="text-gray-500 hover:text-indigo-400 transition-colors p-1"
                    title="플레이리스트에 추가"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
