import { useState, useEffect, useCallback } from 'react'
import { useLibraryStore } from '../../store/libraryStore'
import { usePlaylistStore } from '../../store/playlistStore'
import { VideoCard } from './VideoCard'
import { TagFilter } from './TagFilter'
import { SortBar } from './SortBar'
import type { Video } from '../../types'

interface Props {
  onPlayVideo: (video: Video) => void
}

export function LibraryView({ onPlayVideo }: Props) {
  const { videos, isLoading, setFilter, filter, refreshAll } = useLibraryStore()
  const playlist = usePlaylistStore()
  const [search, setSearch] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

  useEffect(() => {
    refreshAll()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter({ search: search || undefined, tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedTagIds])

  const toggleTag = useCallback((tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }, [])

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0 gap-4 flex-wrap">
        <SortBar search={search} onSearchChange={setSearch} />
        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="text-gray-500 hover:text-white transition-colors p-1"
            title="새로고침"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </button>
          <span className="text-xs text-gray-600">{videos.length}개</span>
        </div>
      </div>

      {/* Tag filter */}
      <div className="px-4 py-2 border-b border-gray-800 shrink-0">
        <TagFilter selectedTagIds={selectedTagIds} onToggle={toggleTag} onClear={() => setSelectedTagIds([])} />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm text-center">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
            <p>라이브러리가 비어 있습니다</p>
            <p className="text-xs mt-1">파일 탐색기에서 동영상을 추가하세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={onPlayVideo}
                onAddToPlaylist={(v) => playlist.addVideo(v)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
