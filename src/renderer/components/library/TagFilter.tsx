import { useLibraryStore } from '../../store/libraryStore'

interface Props {
  selectedTagIds: number[]
  onToggle: (tagId: number) => void
  onClear: () => void
}

export function TagFilter({ selectedTagIds, onToggle, onClear }: Props) {
  const { tags } = useLibraryStore()

  if (tags.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 shrink-0">태그 필터:</span>
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.id)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all border ${
              isSelected ? 'ring-2 ring-white/30' : 'opacity-50 hover:opacity-80'
            }`}
            style={{
              backgroundColor: `${tag.color}33`,
              color: tag.color,
              borderColor: `${tag.color}66`
            }}
          >
            {tag.name}
          </button>
        )
      })}
      {selectedTagIds.length > 0 && (
        <button
          onClick={onClear}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          초기화
        </button>
      )}
    </div>
  )
}
