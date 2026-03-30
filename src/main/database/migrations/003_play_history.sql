CREATE TABLE IF NOT EXISTS play_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id        INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    started_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    ended_at        INTEGER,
    watched_seconds REAL    NOT NULL DEFAULT 0,
    completed       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ps_video   ON play_sessions(video_id);
CREATE INDEX IF NOT EXISTS idx_ps_started ON play_sessions(started_at);

CREATE TABLE IF NOT EXISTS video_stats (
    video_id        INTEGER PRIMARY KEY REFERENCES videos(id) ON DELETE CASCADE,
    play_count      INTEGER NOT NULL DEFAULT 0,
    total_watched   REAL    NOT NULL DEFAULT 0,
    last_played_at  INTEGER,
    last_position   REAL    NOT NULL DEFAULT 0
);
