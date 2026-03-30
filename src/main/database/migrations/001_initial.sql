CREATE TABLE IF NOT EXISTS videos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path   TEXT    NOT NULL UNIQUE,
    title       TEXT    NOT NULL,
    duration    REAL    DEFAULT 0,
    file_size   INTEGER DEFAULT 0,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    last_seen   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS playlists (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS playlist_videos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    video_id    INTEGER NOT NULL REFERENCES videos(id)    ON DELETE CASCADE,
    position    INTEGER NOT NULL DEFAULT 0,
    UNIQUE(playlist_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_pv_playlist ON playlist_videos(playlist_id, position);
