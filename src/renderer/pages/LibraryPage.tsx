import { useVideoContext } from '../store/videoContext'
import { usePlaylistStore } from '../store/playlistStore'
import { LibraryView } from '../components/library/LibraryView'
import type { Video } from '../types'

export function LibraryPage() {
  const { loadVideo } = useVideoContext()
  const playlist = usePlaylistStore()

  const handlePlayVideo = (video: Video) => {
    loadVideo(video)
    playlist.addVideo(video)
  }

  return <LibraryView onPlayVideo={handlePlayVideo} />
}
