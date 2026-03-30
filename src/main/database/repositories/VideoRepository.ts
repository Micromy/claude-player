import { getDb } from '../connection'
import type { Video, VideoFile, VideoFilter } from '../../../renderer/types'

export const VideoRepository = {
  findAll(filter: VideoFilter = {}): Video[] {
    const db = getDb()
    const { tagIds, search, sortBy = 'title', sortOrder = 'ASC' } = filter

    let query = `
      SELECT v.*, vs.play_count, vs.total_watched, vs.last_played_at, vs.last_position
      FROM videos v
      LEFT JOIN video_stats vs ON vs.video_id = v.id
    `
    const params: unknown[] = []
    const conditions: string[] = []

    if (search) {
      conditions.push(`v.title LIKE ?`)
      params.push(`%${search}%`)
    }

    if (tagIds && tagIds.length > 0) {
      const placeholders = tagIds.map(() => '?').join(',')
      conditions.push(`
        (SELECT COUNT(*) FROM video_tags vt WHERE vt.video_id = v.id AND vt.tag_id IN (${placeholders})) = ${tagIds.length}
      `)
      params.push(...tagIds)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    const sortColumn =
      sortBy === 'play_count' || sortBy === 'total_watched' || sortBy === 'last_played_at'
        ? `vs.${sortBy}`
        : `v.${sortBy}`

    query += ` ORDER BY ${sortColumn} ${sortOrder}`

    return db.prepare(query).all(...params) as Video[]
  },

  findById(id: number): Video | null {
    const db = getDb()
    const video = db
      .prepare(
        `SELECT v.*, vs.play_count, vs.total_watched, vs.last_played_at, vs.last_position
         FROM videos v
         LEFT JOIN video_stats vs ON vs.video_id = v.id
         WHERE v.id = ?`
      )
      .get(id) as Video | undefined
    return video ?? null
  },

  findByPath(filePath: string): Video | null {
    const db = getDb()
    const video = db.prepare(`SELECT * FROM videos WHERE file_path = ?`).get(filePath) as Video | undefined
    return video ?? null
  },

  upsertMany(files: VideoFile[]): number {
    const db = getDb()
    const now = Math.floor(Date.now() / 1000)

    const upsert = db.prepare(`
      INSERT INTO videos (file_path, title, file_size, last_seen)
      VALUES (@file_path, @title, @file_size, ${now})
      ON CONFLICT(file_path) DO UPDATE SET
        title = excluded.title,
        file_size = excluded.file_size,
        last_seen = excluded.last_seen
    `)

    const insertMany = db.transaction((videoFiles: VideoFile[]) => {
      let count = 0
      for (const f of videoFiles) {
        upsert.run(f)
        count++
      }
      return count
    })

    return insertMany(files)
  },

  delete(id: number): void {
    const db = getDb()
    db.prepare(`DELETE FROM videos WHERE id = ?`).run(id)
  },

  updateDuration(id: number, duration: number): void {
    const db = getDb()
    db.prepare(`UPDATE videos SET duration = ? WHERE id = ?`).run(duration, id)
  }
}
