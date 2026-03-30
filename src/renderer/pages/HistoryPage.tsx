import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Video } from '../types'

interface VideoWithStats extends Video {
  play_count: number
  total_watched: number
  last_played_at: number | null
  last_position: number
}

function formatDuration(seconds: number): string {
  if (!seconds) return '0분'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분 ${s}초`
  return `${s}초`
}

function formatDate(ts: number | null): string {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function HistoryPage() {
  const [videos, setVideos] = useState<VideoWithStats[]>([])
  const [sortBy, setSortBy] = useState<'play_count' | 'total_watched' | 'last_played_at'>('last_played_at')

  useEffect(() => {
    api.videos.getAll({ sortBy, sortOrder: 'DESC' }).then((vs) => {
      setVideos(vs.filter((v) => (v as VideoWithStats).play_count > 0) as VideoWithStats[])
    })
  }, [sortBy])

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
        <h1 className="text-sm font-semibold text-white">재생 기록</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">정렬:</span>
          {[
            { value: 'last_played_at', label: '최근 재생' },
            { value: 'play_count', label: '재생 횟수' },
            { value: 'total_watched', label: '시청 시간' }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value as typeof sortBy)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                sortBy === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
            <p>재생 기록이 없습니다</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-900 border-b border-gray-800">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400">제목</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 w-24">재생 횟수</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 w-28">총 시청 시간</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 w-44">최근 재생</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-3 text-gray-300 truncate max-w-xs">{video.title}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{video.play_count}회</td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {formatDuration(video.total_watched)}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-500 text-xs">
                    {formatDate(video.last_played_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
