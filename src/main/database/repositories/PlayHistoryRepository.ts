import { getDb } from '../connection'
import type { VideoStats } from '../../../renderer/types'

export const PlayHistoryRepository = {
  startSession(videoId: number): number {
    const db = getDb()
    const result = db
      .prepare(`INSERT INTO play_sessions (video_id) VALUES (?)`)
      .run(videoId)
    return result.lastInsertRowid as number
  },

  updateSession(
    sessionId: number,
    watchedSeconds: number,
    lastPosition: number,
    completed: boolean
  ): void {
    const db = getDb()
    const now = Math.floor(Date.now() / 1000)

    db.prepare(
      `UPDATE play_sessions SET ended_at = ?, watched_seconds = ?, completed = ? WHERE id = ?`
    ).run(now, watchedSeconds, completed ? 1 : 0, sessionId)

    // Update or insert video_stats
    db.prepare(
      `INSERT INTO video_stats (video_id, play_count, total_watched, last_played_at, last_position)
       VALUES ((SELECT video_id FROM play_sessions WHERE id = ?), 1, ?, ?, ?)
       ON CONFLICT(video_id) DO UPDATE SET
         play_count = play_count + 1,
         total_watched = total_watched + excluded.total_watched,
         last_played_at = excluded.last_played_at,
         last_position = excluded.last_position`
    ).run(sessionId, watchedSeconds, now, lastPosition)
  },

  getStats(videoId: number): VideoStats | null {
    const db = getDb()
    return (
      (db
        .prepare(`SELECT * FROM video_stats WHERE video_id = ?`)
        .get(videoId) as VideoStats) ?? null
    )
  },

  updateLastPosition(videoId: number, position: number): void {
    const db = getDb()
    db.prepare(
      `INSERT INTO video_stats (video_id, last_position)
       VALUES (?, ?)
       ON CONFLICT(video_id) DO UPDATE SET last_position = excluded.last_position`
    ).run(videoId, position)
  },

  getRecentlyPlayed(limit = 20): { video_id: number; last_played_at: number }[] {
    const db = getDb()
    return db
      .prepare(
        `SELECT video_id, last_played_at FROM video_stats
         WHERE last_played_at IS NOT NULL
         ORDER BY last_played_at DESC
         LIMIT ?`
      )
      .all(limit) as { video_id: number; last_played_at: number }[]
  }
}
