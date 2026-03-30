export interface Video {
  id: number
  file_path: string
  title: string
  duration: number
  file_size: number
  created_at: number
  last_seen: number
  tags?: Tag[]
  stats?: VideoStats
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface Playlist {
  id: number
  name: string
  created_at: number
  updated_at: number
  videos?: PlaylistVideo[]
}

export interface PlaylistVideo {
  id: number
  playlist_id: number
  video_id: number
  position: number
  video?: Video
}

export interface VideoStats {
  video_id: number
  play_count: number
  total_watched: number
  last_played_at: number | null
  last_position: number
}

export interface PlaySession {
  id: number
  video_id: number
  started_at: number
  ended_at: number | null
  watched_seconds: number
  completed: number
}

export interface ScanProgress {
  found: number
  total: number
}

export interface VideoFilter {
  tagIds?: number[]
  search?: string
  sortBy?: 'title' | 'play_count' | 'total_watched' | 'last_played_at' | 'created_at'
  sortOrder?: 'ASC' | 'DESC'
}

export interface VideoFile {
  file_path: string
  title: string
  file_size: number
}
