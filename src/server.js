const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../db/database');
const PostScheduler = require('../scheduler/post-scheduler');
const CommentWorker = require('../workers/comment-worker');
const StatsWorker = require('../workers/stats-worker');
const RateLimiter = require('../utils/rate-limiter');
const Logger = require('../utils/logger');

const app = express();
const logger = new Logger();

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/terms', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const termsPath = path.join(__dirname, '..', 'TERMS.md');
  
  fs.readFile(termsPath, 'utf-8', (err, data) => {
    if (err) {
      res.status(404).json({ error: 'Terms not found' });
    } else {
      res.set('Content-Type', 'text/markdown');
      res.send(data);
    }
  });
});

app.get('/accounts', async (req, res) => {
  try {
    const accounts = await db.all('SELECT id, username, is_active, created_at FROM accounts');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/accounts', async (req, res) => {
  try {
    const { tiktok_user_id, username, access_token, refresh_token } = req.body;

    const result = await db.run(
      'INSERT INTO accounts (tiktok_user_id, username, access_token, refresh_token) VALUES (?, ?, ?, ?)',
      [tiktok_user_id, username, access_token, refresh_token]
    );

    await logger.log(result.id, 'ACCOUNT_CREATED', 'success', `New account added: ${username}`);

    res.json({ id: result.id, username });
  } catch (error) {
    await logger.log(null, 'ACCOUNT_ERROR', 'error', 'Failed to add account', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/videos', async (req, res) => {
  try {
    const videos = await db.all('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/videos', async (req, res) => {
  try {
    const { account_id, title, description, scheduled_post_time } = req.body;

    const video = await PostScheduler.addVideo(
      account_id,
      title,
      description,
      scheduled_post_time
    );

    await logger.log(account_id, 'VIDEO_SCHEDULED', 'success', `Video scheduled: ${title}`);

    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/stats/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const stats = await StatsWorker.getAccountStats(accountId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/comments/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const comments = await db.all(
      "SELECT * FROM comments WHERE account_id = ? ORDER BY created_at DESC",
      [accountId]
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/logs', async (req, res) => {
  try {
    const logs = await logger.getLogs(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/rate-limits/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const remaining = {
      posts: await RateLimiter.getRemainingActions(accountId, 'post'),
      comments: await RateLimiter.getRemainingActions(accountId, 'comment'),
      stats: await RateLimiter.getRemainingActions(accountId, 'stats')
    };

    res.json(remaining);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
