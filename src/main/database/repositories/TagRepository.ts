import { getDb } from '../connection'
import type { Tag } from '../../../renderer/types'

export const TagRepository = {
  findAll(): Tag[] {
    const db = getDb()
    return db.prepare(`SELECT * FROM tags ORDER BY name`).all() as Tag[]
  },

  findByVideo(videoId: number): Tag[] {
    const db = getDb()
    return db
      .prepare(
        `SELECT t.* FROM tags t
         INNER JOIN video_tags vt ON vt.tag_id = t.id
         WHERE vt.video_id = ?
         ORDER BY t.name`
      )
      .all(videoId) as Tag[]
  },

  create(name: string, color: string): Tag {
    const db = getDb()
    const result = db.prepare(`INSERT INTO tags (name, color) VALUES (?, ?)`).run(name, color)
    return db.prepare(`SELECT * FROM tags WHERE id = ?`).get(result.lastInsertRowid) as Tag
  },

  update(id: number, name: string, color: string): void {
    const db = getDb()
    db.prepare(`UPDATE tags SET name = ?, color = ? WHERE id = ?`).run(name, color, id)
  },

  delete(id: number): void {
    const db = getDb()
    db.prepare(`DELETE FROM tags WHERE id = ?`).run(id)
  },

  assignToVideo(videoId: number, tagId: number): void {
    const db = getDb()
    db.prepare(
      `INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)`
    ).run(videoId, tagId)
  },

  removeFromVideo(videoId: number, tagId: number): void {
    const db = getDb()
    db.prepare(`DELETE FROM video_tags WHERE video_id = ? AND tag_id = ?`).run(videoId, tagId)
  },

  setVideoTags(videoId: number, tagIds: number[]): void {
    const db = getDb()
    const update = db.transaction(() => {
      db.prepare(`DELETE FROM video_tags WHERE video_id = ?`).run(videoId)
      const insert = db.prepare(`INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)`)
      for (const tagId of tagIds) {
        insert.run(videoId, tagId)
      }
    })
    update()
  }
}
