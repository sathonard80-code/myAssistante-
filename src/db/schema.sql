-- Accounts Management
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tiktok_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at DATETIME,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Videos Tracking
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  video_id TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  scheduled_post_time DATETIME,
  posted_at DATETIME,
  status TEXT DEFAULT 'pending', -- pending, scheduled, posted, failed
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  last_stats_update DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Comments Tracking
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  video_id TEXT NOT NULL,
  comment_id TEXT UNIQUE NOT NULL,
  author_username TEXT,
  comment_text TEXT,
  response_status TEXT DEFAULT 'pending', -- pending, responded, ignored
  bot_response TEXT,
  responded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Rate Limiting Tracking
CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- post, comment, stats_check
  action_count INTEGER DEFAULT 0,
  reset_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(account_id, action_type),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Logs
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER,
  action TEXT,
  status TEXT, -- success, error, warning
  message TEXT,
  error_details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
CREATE INDEX IF NOT EXISTS idx_videos_account ON videos(account_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_comments_account ON comments(account_id);
CREATE INDEX IF NOT EXISTS idx_logs_account ON logs(account_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at);
