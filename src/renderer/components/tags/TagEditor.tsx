import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { useLibraryStore } from '../../store/libraryStore'
import { TagBadge } from './TagBadge'
import type { Tag, Video } from '../../types'

interface Props {
  video: Video
  onClose: () => void
}

const TAG_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#f97316', '#14b8a6', '#ef4444', '#84cc16'
]

export function TagEditor({ video, onClose }: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [videoTagIds, setVideoTagIds] = useState<Set<number>>(new Set())
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const library = useLibraryStore()

  useEffect(() => {
    const load = async () => {
      const [tags, videoTags] = await Promise.all([
        api.tags.getAll(),
        api.tags.getByVideo(video.id)
      ])
      setAllTags(tags)
      setVideoTagIds(new Set(videoTags.map((t) => t.id)))
    }
    load()
  }, [video.id])

  const toggleTag = async (tagId: number) => {
    const next = new Set(videoTagIds)
    if (next.has(tagId)) next.delete(tagId)
    else next.add(tagId)
    setVideoTagIds(next)
    await api.tags.setVideoTags(video.id, [...next])
    library.refreshAll()
  }

  const createTag = async () => {
    const name = newTagName.trim()
    if (!name) return
    const tag = await api.tags.create(name, newTagColor)
    setAllTags((prev) => [...prev, tag])
    setNewTagName('')
    library.loadTags()
  }

  const deleteTag = async (tagId: number) => {
    await api.tags.delete(tagId)
    setAllTags((prev) => prev.filter((t) => t.id !== tagId))
    setVideoTagIds((prev) => {
      const next = new Set(prev)
      next.delete(tagId)
      return next
    })
    library.loadTags()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-xl shadow-2xl w-96 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">태그 편집</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-2 border-b border-gray-800 shrink-0">
          <p className="text-xs text-gray-500 truncate">{video.title}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {allTags.length === 0 && (
              <p className="text-xs text-gray-600">태그가 없습니다. 아래에서 생성하세요.</p>
            )}
            {allTags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-1">
                <button
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all border ${
                    videoTagIds.has(tag.id)
                      ? 'opacity-100 ring-2 ring-white/30'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: `${tag.color}33`,
                    color: tag.color,
                    borderColor: `${tag.color}66`
                  }}
                >
                  {tag.name}
                </button>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="text-gray-700 hover:text-red-400 transition-colors"
                  title="태그 삭제"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New tag creation */}
        <div className="px-5 py-4 border-t border-gray-800 shrink-0">
          <p className="text-xs text-gray-400 mb-2">새 태그 추가</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createTag()}
              placeholder="태그 이름..."
              className="flex-1 bg-gray-800 text-white text-xs rounded px-3 py-2 border border-gray-700 focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex items-center gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className={`w-4 h-4 rounded-full transition-transform ${newTagColor === color ? 'scale-125 ring-2 ring-white/50' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              onClick={createTag}
              disabled={!newTagName.trim()}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded transition-colors"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
