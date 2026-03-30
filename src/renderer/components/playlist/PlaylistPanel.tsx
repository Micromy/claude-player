import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { usePlaylistStore } from '../../store/playlistStore'
import { usePlayerStore } from '../../store/playerStore'
import { PlaylistItem } from './PlaylistItem'
import type { Video } from '../../types'

interface Props {
  onPlayVideo: (video: Video) => void
}

export function PlaylistPanel({ onPlayVideo }: Props) {
  const playlist = usePlaylistStore()
  const { currentVideo } = usePlayerStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = playlist.items.findIndex((v) => v.id === active.id)
    const to = playlist.items.findIndex((v) => v.id === over.id)
    if (from !== -1 && to !== -1) playlist.moveItem(from, to)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
        <h2 className="text-sm font-semibold text-gray-200">
          플레이리스트 <span className="text-gray-500 font-normal">({playlist.items.length})</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={playlist.shuffle}
            disabled={playlist.items.length < 2}
            className="text-gray-500 hover:text-white disabled:opacity-30 transition-colors p-1"
            title="Shuffle"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>
          <button
            onClick={playlist.clear}
            disabled={playlist.items.length === 0}
            className="text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors p-1"
            title="Clear playlist"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {playlist.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm text-center px-4">
            <svg className="w-10 h-10 mb-2 opacity-40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
            <p>비어 있습니다</p>
            <p className="text-xs mt-1">파일 탐색기에서 추가하세요</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={playlist.items.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              {playlist.items.map((video, index) => (
                <PlaylistItem
                  key={video.id}
                  video={video}
                  index={index}
                  isActive={currentVideo?.id === video.id}
                  onPlay={() => {
                    playlist.jumpTo(index)
                    onPlayVideo(video)
                  }}
                  onRemove={() => playlist.removeAt(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
