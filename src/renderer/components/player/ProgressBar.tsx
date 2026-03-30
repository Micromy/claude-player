import { useRef, useCallback } from 'react'
import { usePlayerStore } from '../../store/playerStore'

interface Props {
  onSeek: (seconds: number) => void
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ProgressBar({ onSeek }: Props) {
  const { currentTime, duration } = usePlayerStore()
  const barRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const getPositionFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    const bar = barRef.current
    if (!bar || !duration) return 0
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    return ratio * duration
  }, [duration])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    onSeek(getPositionFromEvent(e))

    const onMouseMove = (me: MouseEvent) => {
      if (isDragging.current) onSeek(getPositionFromEvent(me))
    }
    const onMouseUp = (me: MouseEvent) => {
      isDragging.current = false
      onSeek(getPositionFromEvent(me))
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [getPositionFromEvent, onSeek])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-2 w-full px-4">
      <span className="text-xs text-gray-400 w-12 text-right shrink-0">{formatTime(currentTime)}</span>
      <div
        ref={barRef}
        className="relative flex-1 h-1.5 bg-gray-600 rounded-full cursor-pointer group"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full transition-none"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-12 shrink-0">{formatTime(duration)}</span>
    </div>
  )
}
