import { useVideoContext } from '../../store/videoContext'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { usePlayerStore } from '../../store/playerStore'
import { usePlaylistStore } from '../../store/playlistStore'
import { PlayerControls } from './PlayerControls'

export function VideoPlayer() {
  const {
    videoRef,
    loadVideo,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    toggleFullscreen,
    setPlaybackRate
  } = useVideoContext()

  const { volume, currentVideo } = usePlayerStore()
  const playlist = usePlaylistStore()

  useKeyboardShortcuts({ togglePlay, seekRelative, setVolume, toggleMute, toggleFullscreen, volume })

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Video area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-black relative">
        {!currentVideo && (
          <div className="text-gray-600 text-center select-none pointer-events-none">
            <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
            <p className="text-sm">플레이리스트에서 동영상을 선택하거나<br />파일 탐색기에서 추가하세요</p>
          </div>
        )}
        <video
          ref={videoRef}
          className="max-w-full max-h-full"
          onDoubleClick={toggleFullscreen}
          style={{ display: currentVideo ? 'block' : 'none' }}
        />
      </div>

      {/* Controls */}
      <PlayerControls
        onTogglePlay={togglePlay}
        onSeek={seek}
        onSeekRelative={seekRelative}
        onVolumeChange={setVolume}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onPlaybackRateChange={setPlaybackRate}
        onNext={() => {
          const next = playlist.next()
          if (next) loadVideo(next)
        }}
        onPrev={() => {
          const prev = playlist.prev()
          if (prev) loadVideo(prev)
        }}
        loadVideo={loadVideo}
      />
    </div>
  )
}
