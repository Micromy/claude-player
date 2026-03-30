import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { TagBadge } from '../tags/TagBadge'
import { TagEditor } from '../tags/TagEditor'
import type { Video, Tag } from '../../types'

interface Props {
  video: Video
  onPlay: (video: Video) => void
  onAddToPlaylist: (video: Video) => void
}

function formatDuration(seconds: number): string {
  if (!seconds) return '--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(ts: number | null | undefined): string {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleDateString('ko-KR')
}

export function VideoCard({ video, onPlay, onAddToPlaylist }: Props) {
  const [tags, setTags] = useState<Tag[]>([])
  const [showTagEditor, setShowTagEditor] = useState(false)

  useEffect(() => {
    api.tags.getByVideo(video.id).then(setTags)
  }, [video.id])

  return (
    <>
      <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors group">
        {/* Thumbnail area */}
        <div
          className="aspect-video bg-gray-800 flex items-center justify-center cursor-pointer relative"
          onDoubleClick={() => onPlay(video)}
        >
          <svg className="w-10 h-10 text-gray-600 group-hover:text-gray-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
          </svg>
          {video.duration > 0 && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <button
              onClick={() => onPlay(video)}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 backdrop-blur transition-colors"
            >
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm text-gray-200 font-medium truncate mb-1" title={video.title}>
            {video.title}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            {(video as Video & { play_count?: number }).play_count !== undefined && (
              <span title="재생 횟수">▶ {(video as Video & { play_count?: number }).play_count}회</span>
            )}
            {(video as Video & { last_played_at?: number | null }).last_played_at && (
              <span title="마지막 재생">{formatDate((video as Video & { last_played_at?: number | null }).last_played_at)}</span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} small />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAddToPlaylist(video)}
              className="text-xs text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
              추가
            </button>
            <button
              onClick={() => setShowTagEditor(true)}
              className="text-xs text-gray-500 hover:text-yellow-400 transition-colors flex items-center gap-1 ml-auto"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
              </svg>
              태그
            </button>
          </div>
        </div>
      </div>

      {showTagEditor && (
        <TagEditor video={video} onClose={() => setShowTagEditor(false)} />
      )}
    </>
  )
}
