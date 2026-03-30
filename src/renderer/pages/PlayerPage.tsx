import { useState } from 'react'
import { VideoPlayer } from '../components/player/VideoPlayer'
import { PlaylistPanel } from '../components/playlist/PlaylistPanel'
import { FileBrowser } from '../components/browser/FileBrowser'
import { useVideoContext } from '../store/videoContext'
import { usePlaylistStore } from '../store/playlistStore'
import { api } from '../api/client'
import type { Video } from '../types'

type SideTab = 'browser' | 'playlist'

export function PlayerPage() {
  const [sideTab, setSideTab] = useState<SideTab>('browser')
  const { loadVideo } = useVideoContext()
  const playlist = usePlaylistStore()

  const handlePlayFromBrowser = async (filePath: string, _title: string) => {
    // Ensure video is in DB
    await api.fs.addFiles([filePath])
    const videos = await api.videos.getAll()
    const found = videos.find((v) => v.file_path === filePath)
    if (found) {
      loadVideo(found)
      playlist.addVideo(found)
    }
  }

  const handlePlayFromPlaylist = (video: Video) => {
    loadVideo(video)
  }

  return (
    <div className="flex h-full">
      {/* Left: Video + controls */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 min-h-0">
          <VideoPlayer />
        </div>
      </div>

      {/* Right: Side panel */}
      <div className="w-72 flex flex-col shrink-0 border-l border-gray-800">
        {/* Tab switcher */}
        <div className="flex border-b border-gray-800 shrink-0">
          <button
            onClick={() => setSideTab('browser')}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              sideTab === 'browser'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            파일 탐색기
          </button>
          <button
            onClick={() => setSideTab('playlist')}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              sideTab === 'playlist'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            플레이리스트 ({playlist.items.length})
          </button>
        </div>

        <div className="flex-1 min-h-0">
          {sideTab === 'browser' ? (
            <FileBrowser onPlayVideo={handlePlayFromBrowser} />
          ) : (
            <PlaylistPanel onPlayVideo={handlePlayFromPlaylist} />
          )}
        </div>
      </div>
    </div>
  )
}
