const db = require('../db/database');
const TikTokAPI = require('../api/tiktok-client');
const RateLimiter = require('../utils/rate-limiter');
const Logger = require('../utils/logger');

class StatsWorker {
  constructor() {
    this.logger = new Logger();
  }

  async init() {
    console.log('📊 Initializing Stats Worker...');
    this.startPolling();
  }

  async updateAllStats() {
    const accounts = await db.all('SELECT * FROM accounts WHERE is_active = 1');

    for (const account of accounts) {
      await this.updateAccountStats(account);
    }
  }

  async updateAccountStats(account) {
    try {
      const canCheck = await RateLimiter.canCheckStats(account.id);
      if (!canCheck) {
        console.log(`⚠️ Stats check rate limited for account: ${account.username}`);
        return;
      }

      const api = new TikTokAPI(account.access_token);
      const videos = await db.all(
        "SELECT * FROM videos WHERE account_id = ? AND status = 'posted'",
        [account.id]
      );

      for (const video of videos) {
        try {
          const stats = await api.getVideoStats(video.video_id);

          await db.run(
            'UPDATE videos SET views = ?, likes = ?, comments = ?, shares = ?, last_stats_update = CURRENT_TIMESTAMP WHERE id = ?',
            [stats.view_count, stats.like_count, stats.comment_count, stats.share_count, video.id]
          );

          console.log(`📊 Updated stats for ${video.title}: ${stats.view_count} views`);
        } catch (error) {
          console.error(`Failed to update stats for video ${video.id}:`, error.message);
        }
      }

      await this.logger.log(
        account.id,
        'STATS_UPDATED',
        'success',
        `Updated stats for ${videos.length} videos`
      );
    } catch (error) {
      await this.logger.log(
        account.id,
        'STATS_UPDATE_FAILED',
        'error',
        'Failed to update stats',
        error.message
      );
    }
  }

  async getAccountStats(accountId) {
    const stats = await db.all(
      `SELECT 
        SUM(views) as total_views,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(shares) as total_shares,
        COUNT(*) as video_count
      FROM videos WHERE account_id = ? AND status = 'posted'`,
      [accountId]
    );

    return stats[0] || { total_views: 0, total_likes: 0, total_comments: 0, total_shares: 0, video_count: 0 };
  }

  startPolling() {
    setInterval(async () => {
      await this.updateAllStats();
    }, 300000); // Check every 5 minutes
  }

  stop() {
    console.log('⛔ Stats Worker stopped');
  }
}

module.exports = new StatsWorker();
