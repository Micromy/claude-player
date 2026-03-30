import { getDb } from '../connection'
import type { Playlist, Video } from '../../../renderer/types'

export const PlaylistRepository = {
  findAll(): Playlist[] {
    const db = getDb()
    return db.prepare(`SELECT * FROM playlists ORDER BY updated_at DESC`).all() as Playlist[]
  },

  findById(id: number): Playlist | null {
    const db = getDb()
    return (db.prepare(`SELECT * FROM playlists WHERE id = ?`).get(id) as Playlist) ?? null
  },

  getVideos(playlistId: number): Video[] {
    const db = getDb()
    return db
      .prepare(
        `SELECT v.* FROM videos v
         INNER JOIN playlist_videos pv ON pv.video_id = v.id
         WHERE pv.playlist_id = ?
         ORDER BY pv.position ASC`
      )
      .all(playlistId) as Video[]
  },

  create(name: string): Playlist {
    const db = getDb()
    const result = db.prepare(`INSERT INTO playlists (name) VALUES (?)`).run(name)
    return db.prepare(`SELECT * FROM playlists WHERE id = ?`).get(result.lastInsertRowid) as Playlist
  },

  rename(id: number, name: string): void {
    const db = getDb()
    const now = Math.floor(Date.now() / 1000)
    db.prepare(`UPDATE playlists SET name = ?, updated_at = ? WHERE id = ?`).run(name, now, id)
  },

  delete(id: number): void {
    const db = getDb()
    db.prepare(`DELETE FROM playlists WHERE id = ?`).run(id)
  },

  addVideo(playlistId: number, videoId: number): void {
    const db = getDb()
    const maxPos = (
      db
        .prepare(
          `SELECT COALESCE(MAX(position), -1) as maxPos FROM playlist_videos WHERE playlist_id = ?`
        )
        .get(playlistId) as { maxPos: number }
    ).maxPos
    db
      .prepare(
        `INSERT OR IGNORE INTO playlist_videos (playlist_id, video_id, position) VALUES (?, ?, ?)`
      )
      .run(playlistId, videoId, maxPos + 1)
    db
      .prepare(`UPDATE playlists SET updated_at = ? WHERE id = ?`)
      .run(Math.floor(Date.now() / 1000), playlistId)
  },

  addVideos(playlistId: number, videoIds: number[]): void {
    const db = getDb()
    const maxPos = (
      db
        .prepare(
          `SELECT COALESCE(MAX(position), -1) as maxPos FROM playlist_videos WHERE playlist_id = ?`
        )
        .get(playlistId) as { maxPos: number }
    ).maxPos

    const insert = db.prepare(
      `INSERT OR IGNORE INTO playlist_videos (playlist_id, video_id, position) VALUES (?, ?, ?)`
    )
    const batch = db.transaction(() => {
      videoIds.forEach((videoId, i) => {
        insert.run(playlistId, videoId, maxPos + 1 + i)
      })
    })
    batch()
    db
      .prepare(`UPDATE playlists SET updated_at = ? WHERE id = ?`)
      .run(Math.floor(Date.now() / 1000), playlistId)
  },

  removeVideo(playlistId: number, videoId: number): void {
    const db = getDb()
    db
      .prepare(`DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?`)
      .run(playlistId, videoId)
  },

  reorder(playlistId: number, videoIds: number[]): void {
    const db = getDb()
    const update = db.prepare(
      `UPDATE playlist_videos SET position = ? WHERE playlist_id = ? AND video_id = ?`
    )
    const batch = db.transaction(() => {
      videoIds.forEach((videoId, i) => {
        update.run(i, playlistId, videoId)
      })
    })
    batch()
  },

  clearVideos(playlistId: number): void {
    const db = getDb()
    db.prepare(`DELETE FROM playlist_videos WHERE playlist_id = ?`).run(playlistId)
  }
}
