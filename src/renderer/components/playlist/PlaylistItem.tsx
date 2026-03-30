import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Video } from '../../types'

interface Props {
  video: Video
  index: number
  isActive: boolean
  onPlay: () => void
  onRemove: () => void
}

function formatDuration(seconds: number): string {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PlaylistItem({ video, index, isActive, onPlay, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 group cursor-pointer hover:bg-gray-800 ${
        isActive ? 'bg-indigo-900/40 border-l-2 border-indigo-500' : ''
      }`}
      onClick={onPlay}
    >
      {/* Drag handle */}
      <button
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {/* Index */}
      <span className="text-xs text-gray-600 w-5 shrink-0 text-right">{index + 1}</span>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
          {video.title}
        </p>
      </div>

      {/* Duration */}
      <span className="text-xs text-gray-500 shrink-0">{formatDuration(video.duration)}</span>

      {/* Remove button */}
      <button
        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        title="Remove from playlist"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  )
}
