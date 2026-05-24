const db = require('../db/database');
const TikTokAPI = require('../api/tiktok-client');
const RateLimiter = require('../utils/rate-limiter');
const Logger = require('../utils/logger');

class CommentWorker {
  constructor() {
    this.logger = new Logger();
  }

  async init() {
    console.log('💬 Initializing Comment Worker...');
    this.startPolling();
  }

  async checkAndReplyComments() {
    const accounts = await db.all('SELECT * FROM accounts WHERE is_active = 1');

    for (const account of accounts) {
      await this.processAccountComments(account);
    }
  }

  async processAccountComments(account) {
    try {
      const api = new TikTokAPI(account.access_token);
      const videos = await db.all(
        "SELECT * FROM videos WHERE account_id = ? AND status = 'posted'",
        [account.id]
      );

      for (const video of videos) {
        await this.checkVideoComments(api, account, video);
      }
    } catch (error) {
      await this.logger.log(
        account.id,
        'COMMENT_CHECK_FAILED',
        'error',
        'Failed to check comments',
        error.message
      );
    }
  }

  async checkVideoComments(api, account, video) {
    try {
      const comments = await api.getComments(video.video_id);

      if (!comments || !comments.comments) return;

      for (const comment of comments.comments) {
        const existing = await db.get(
          'SELECT * FROM comments WHERE comment_id = ?',
          [comment.id]
        );

        if (!existing) {
          await db.run(
            'INSERT INTO comments (account_id, video_id, comment_id, author_username, comment_text) VALUES (?, ?, ?, ?, ?)',
            [account.id, video.video_id, comment.id, comment.user.unique_id, comment.text]
          );
        }
      }
    } catch (error) {
      console.error(`Failed to check comments for video ${video.video_id}:`, error.message);
    }
  }

  async replyToComments() {
    const pendingComments = await db.all(
      "SELECT * FROM comments WHERE response_status = 'pending' LIMIT 5"
    );

    for (const comment of pendingComments) {
      await this.replyToComment(comment);
    }
  }

  async replyToComment(comment) {
    try {
      const account = await db.get(
        'SELECT * FROM accounts WHERE id = ?',
        [comment.account_id]
      );

      if (!account) throw new Error('Account not found');

      const canComment = await RateLimiter.canComment(comment.account_id);
      if (!canComment) {
        await this.logger.log(
          comment.account_id,
          'COMMENT_RATE_LIMITED',
          'warning',
          'Rate limit reached for comments'
        );
        return;
      }

      const api = new TikTokAPI(account.access_token);
      const response = `Thanks for your comment! @${comment.author_username} 🙌`;

      await api.replyToComment(comment.comment_id, response);

      await db.run(
        "UPDATE comments SET response_status = 'responded', bot_response = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?",
        [response, comment.id]
      );

      await this.logger.log(
        comment.account_id,
        'COMMENT_REPLIED',
        'success',
        `Replied to @${comment.author_username}`
      );
    } catch (error) {
      await this.logger.log(
        comment.account_id,
        'COMMENT_REPLY_FAILED',
        'error',
        'Failed to reply to comment',
        error.message
      );
    }
  }

  startPolling() {
    setInterval(async () => {
      await this.checkAndReplyComments();
      await this.replyToComments();
    }, 60000); // Check every minute
  }

  stop() {
    console.log('⛔ Comment Worker stopped');
  }
}

module.exports = new CommentWorker();
