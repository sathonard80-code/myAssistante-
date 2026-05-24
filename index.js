require('dotenv').config();

const http = require('http');
const db = require('./src/db/database');
const app = require('./src/server');
const PostScheduler = require('./src/scheduler/post-scheduler');
const CommentWorker = require('./src/workers/comment-worker');
const StatsWorker = require('./src/workers/stats-worker');
const { start: startDashboard } = require('./src/cli/dashboard');

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // Initialize database
    await db.init();

    // Initialize workers
    await PostScheduler.init();
    await CommentWorker.init();
    await StatsWorker.init();

    // Start HTTP server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`\n🚀 TikTok Bot Server running on http://localhost:${PORT}`);
      console.log('📡 API endpoints available');
      console.log('');
    });

    // Start CLI dashboard
    await startDashboard();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⛔ Shutting down gracefully...');
      PostScheduler.stop();
      CommentWorker.stop();
      StatsWorker.stop();
      await db.close();
      server.close(() => {
        console.log('✅ All services stopped');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
