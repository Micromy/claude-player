import { useLibraryStore } from '../../store/libraryStore'
import type { VideoFilter } from '../../types'

const SORT_OPTIONS: { value: VideoFilter['sortBy']; label: string }[] = [
  { value: 'title', label: '제목' },
  { value: 'play_count', label: '재생 횟수' },
  { value: 'total_watched', label: '시청 시간' },
  { value: 'last_played_at', label: '최근 재생' },
  { value: 'created_at', label: '추가일' }
]

interface Props {
  search: string
  onSearchChange: (v: string) => void
}

export function SortBar({ search, onSearchChange }: Props) {
  const { filter, setFilter } = useLibraryStore()

  const toggleOrder = () => {
    setFilter({ sortOrder: filter.sortOrder === 'ASC' ? 'DESC' : 'ASC' })
  }

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="검색..."
          className="bg-gray-800 text-white text-xs rounded pl-7 pr-3 py-1.5 border border-gray-700 focus:border-indigo-500 focus:outline-none w-40"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">정렬:</span>
        <select
          value={filter.sortBy}
          onChange={(e) => setFilter({ sortBy: e.target.value as VideoFilter['sortBy'] })}
          className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1.5 border border-gray-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          onClick={toggleOrder}
          className="text-gray-500 hover:text-white transition-colors p-1"
          title={filter.sortOrder === 'ASC' ? '오름차순' : '내림차순'}
        >
          {filter.sortOrder === 'ASC' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18h4v-2H4v2zm0-14v2h16V4H4zm0 8h10v-2H4v2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm4 6h8v2H8zm4 6h0v-2h-4v2h4z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
