-- Content table: stores all published markdown content
CREATE TABLE IF NOT EXISTS content (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_zh TEXT,
  body TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  collection TEXT NOT NULL DEFAULT 'blog',
  series TEXT,
  tags TEXT,
  date TEXT,
  og_description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for listing by collection
CREATE INDEX IF NOT EXISTS idx_content_collection ON content(collection, date DESC);

-- Index for language filtering
CREATE INDEX IF NOT EXISTS idx_content_language ON content(language);
