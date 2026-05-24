const schedule = require('node-schedule');
const db = require('../db/database');
const TikTokAPI = require('../api/tiktok-client');
const RateLimiter = require('../utils/rate-limiter');
const Logger = require('../utils/logger');

class PostScheduler {
  constructor() {
    this.logger = new Logger();
    this.jobs = new Map();
  }

  async init() {
    console.log('📅 Initializing Post Scheduler...');
    await this.scheduleExistingVideos();
    this.startDailyChecker();
  }

  async scheduleExistingVideos() {
    const scheduledVideos = await db.all(
      "SELECT * FROM videos WHERE status = 'scheduled'"
    );

    for (const video of scheduledVideos) {
      this.schedulePost(video);
    }

    console.log(`📅 Scheduled ${scheduledVideos.length} pending posts`);
  }

  schedulePost(video) {
    const jobKey = `post-${video.id}`;
    const scheduledTime = new Date(video.scheduled_post_time);

    if (scheduledTime < new Date()) {
      this.publishNow(video);
      return;
    }

    const job = schedule.scheduleJob(scheduledTime, async () => {
      await this.publishNow(video);
      this.jobs.delete(jobKey);
    });

    this.jobs.set(jobKey, job);
    console.log(`📅 Post scheduled for ${video.title} at ${scheduledTime}`);
  }

  async publishNow(video) {
    try {
      const account = await db.get(
        'SELECT * FROM accounts WHERE id = ?',
        [video.account_id]
      );

      if (!account) throw new Error('Account not found');

      const canPost = await RateLimiter.canPost(video.account_id);
      if (!canPost) {
        throw new Error('Rate limit exceeded for posting');
      }

      const api = new TikTokAPI(account.access_token);

      await db.run(
        "UPDATE videos SET status = 'posted', posted_at = CURRENT_TIMESTAMP WHERE id = ?",
        [video.id]
      );

      await this.logger.log(
        video.account_id,
        'POST_PUBLISHED',
        'success',
        `Video posted: ${video.title}`
      );

    } catch (error) {
      await this.logger.log(
        video.account_id,
        'POST_FAILED',
        'error',
        `Failed to post video: ${video.title}`,
        error.message
      );

      await db.run(
        "UPDATE videos SET status = 'failed' WHERE id = ?",
        [video.id]
      );
    }
  }

  async addVideo(accountId, title, description, scheduledTime) {
    const canPost = await RateLimiter.canPost(accountId);
    if (!canPost) {
      throw new Error('Daily post limit reached');
    }

    const result = await db.run(
      'INSERT INTO videos (account_id, title, description, scheduled_post_time, status) VALUES (?, ?, ?, ?, ?)',
      [accountId, title, description, scheduledTime, 'scheduled']
    );

    const video = await db.get('SELECT * FROM videos WHERE id = ?', [result.id]);
    this.schedulePost(video);

    return video;
  }

  startDailyChecker() {
    schedule.scheduleJob('0 0 * * *', async () => {
      console.log('🔄 Running daily rate limit reset...');
      await db.run("DELETE FROM rate_limits WHERE action_type = 'post'");
    });
  }

  stop() {
    this.jobs.forEach((job) => job.cancel());
    this.jobs.clear();
    console.log('⛔ Post Scheduler stopped');
  }
}

module.exports = new PostScheduler();
