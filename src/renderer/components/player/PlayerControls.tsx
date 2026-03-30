import { usePlayerStore } from '../../store/playerStore'
import { usePlaylistStore } from '../../store/playlistStore'
import { ProgressBar } from './ProgressBar'
import { VolumeControl } from './VolumeControl'

interface Props {
  onTogglePlay: () => void
  onSeek: (seconds: number) => void
  onSeekRelative: (delta: number) => void
  onVolumeChange: (v: number) => void
  onToggleMute: () => void
  onToggleFullscreen: () => void
  onPlaybackRateChange: (rate: number) => void
  onNext: () => void
  onPrev: () => void
  loadVideo: (video: import('../../types').Video) => void
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function PlayerControls({
  onTogglePlay,
  onSeek,
  onSeekRelative,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onPlaybackRateChange,
  onNext,
  onPrev,
  loadVideo
}: Props) {
  const { isPlaying, playbackRate, currentVideo } = usePlayerStore()
  const { items, currentIndex } = usePlaylistStore()

  const handleNext = () => {
    const next = items[currentIndex + 1]
    if (next) {
      onNext()
      loadVideo(next)
    }
  }

  const handlePrev = () => {
    const prev = items[currentIndex - 1]
    if (prev) {
      onPrev()
      loadVideo(prev)
    }
  }

  if (!currentVideo) return null

  return (
    <div className="flex flex-col gap-2 py-3 bg-gray-900/95 backdrop-blur">
      <ProgressBar onSeek={onSeek} />

      <div className="flex items-center justify-between px-4">
        {/* Left: prev/play/next + seek */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Previous"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={() => onSeekRelative(-10)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Rewind 10s"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              <text x="8.5" y="14" fontSize="5" fill="currentColor">10</text>
            </svg>
          </button>

          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => onSeekRelative(10)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Forward 10s"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
              <text x="8.5" y="14" fontSize="5" fill="currentColor">10</text>
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= items.length - 1}
            className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Next"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <VolumeControl onVolumeChange={onVolumeChange} onToggleMute={onToggleMute} />
        </div>

        {/* Center: title */}
        <div className="text-sm text-gray-300 truncate max-w-xs text-center">
          {currentVideo.title}
        </div>

        {/* Right: playback rate + fullscreen */}
        <div className="flex items-center gap-3">
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
            className="bg-gray-800 text-gray-300 text-xs rounded px-1.5 py-1 border border-gray-600 cursor-pointer"
          >
            {RATES.map((r) => (
              <option key={r} value={r}>{r}x</option>
            ))}
          </select>

          <button
            onClick={onToggleFullscreen}
            className="text-gray-400 hover:text-white transition-colors"
            title="Fullscreen (F)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
