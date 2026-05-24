const db = require('../db/database');
const Logger = require('../utils/logger');

class RateLimiter {
  constructor() {
    this.logger = new Logger();
  }

  async checkLimit(accountId, actionType, limit) {
    const rateLimit = await db.get(
      'SELECT * FROM rate_limits WHERE account_id = ? AND action_type = ?',
      [accountId, actionType]
    );

    const now = new Date();

    if (!rateLimit) {
      await db.run(
        'INSERT INTO rate_limits (account_id, action_type, action_count, reset_at) VALUES (?, ?, ?, ?)',
        [accountId, actionType, 1, new Date(now.getTime() + 24 * 60 * 60 * 1000)]
      );
      return true;
    }

    if (new Date(rateLimit.reset_at) < now) {
      await db.run(
        'UPDATE rate_limits SET action_count = 1, reset_at = ? WHERE id = ?',
        [new Date(now.getTime() + 24 * 60 * 60 * 1000), rateLimit.id]
      );
      return true;
    }

    if (rateLimit.action_count < limit) {
      await db.run(
        'UPDATE rate_limits SET action_count = action_count + 1 WHERE id = ?',
        [rateLimit.id]
      );
      return true;
    }

    return false;
  }

  async canPost(accountId) {
    const limit = parseInt(process.env.RATE_LIMIT_POSTS_PER_DAY) || 2;
    return await this.checkLimit(accountId, 'post', limit);
  }

  async canComment(accountId) {
    const limit = parseInt(process.env.RATE_LIMIT_COMMENTS_PER_HOUR) || 10;
    return await this.checkLimit(accountId, 'comment', limit);
  }

  async canCheckStats(accountId) {
    const limit = parseInt(process.env.RATE_LIMIT_STATS_PER_HOUR) || 30;
    return await this.checkLimit(accountId, 'stats', limit);
  }

  async getRemainingActions(accountId, actionType) {
    const rateLimit = await db.get(
      'SELECT * FROM rate_limits WHERE account_id = ? AND action_type = ?',
      [accountId, actionType]
    );

    let limit;
    switch (actionType) {
      case 'post': limit = parseInt(process.env.RATE_LIMIT_POSTS_PER_DAY) || 2; break;
      case 'comment': limit = parseInt(process.env.RATE_LIMIT_COMMENTS_PER_HOUR) || 10; break;
      case 'stats': limit = parseInt(process.env.RATE_LIMIT_STATS_PER_HOUR) || 30; break;
      default: limit = 0;
    }

    if (!rateLimit || new Date(rateLimit.reset_at) < new Date()) {
      return limit;
    }

    return Math.max(0, limit - rateLimit.action_count);
  }
}

module.exports = new RateLimiter();
