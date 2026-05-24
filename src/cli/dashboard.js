const readline = require('readline');
const db = require('../db/database');
const PostScheduler = require('../scheduler/post-scheduler');
const StatsWorker = require('../workers/stats-worker');
const Logger = require('../utils/logger');

const logger = new Logger();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const commands = {
  'help': showHelp,
  'accounts': listAccounts,
  'videos': listVideos,
  'add-video': addVideoInteractive,
  'stats': showStats,
  'logs': showLogs,
  'exit': () => process.exit(0)
};

async function start() {
  console.log('\n🤖 TikTok Bot Dashboard CLI');
  console.log('='.repeat(40));
  console.log('Type "help" for available commands\n');

  await showPrompt();
}

async function showPrompt() {
  rl.question('> ', async (input) => {
    const [command, ...args] = input.trim().split(' ');

    if (commands[command]) {
      await commands[command](args);
    } else {
      console.log('❌ Unknown command. Type "help" for available commands.');
    }

    await showPrompt();
  });
}

function showHelp() {
  console.log(`
📋 Available Commands:
  help            - Show this help message
  accounts        - List all accounts
  videos          - List all scheduled/posted videos
  add-video       - Add a new video to schedule
  stats           - Show account statistics
  logs            - Show recent logs
  exit            - Exit the application
  `);
}

async function listAccounts() {
  const accounts = await db.all('SELECT id, username, is_active FROM accounts');
  if (accounts.length === 0) {
    console.log('No accounts found.');
    return;
  }

  console.log('\n📱 Accounts:');
  accounts.forEach(acc => {
    const status = acc.is_active ? '✅' : '❌';
    console.log(`  ${status} [${acc.id}] ${acc.username}`);
  });
  console.log();
}

async function listVideos() {
  const videos = await db.all('SELECT * FROM videos ORDER BY created_at DESC LIMIT 20');
  if (videos.length === 0) {
    console.log('No videos found.');
    return;
  }

  console.log('\n🎬 Recent Videos:');
  videos.forEach(video => {
    const status = video.status.toUpperCase();
    console.log(`  [${video.id}] ${video.title} - ${status} (${video.views} views)`);
  });
  console.log();
}

async function addVideoInteractive(args) {
  rl.question('Account ID: ', async (accountId) => {
    rl.question('Video Title: ', async (title) => {
      rl.question('Description: ', async (description) => {
        rl.question('Scheduled Time (YYYY-MM-DD HH:MM): ', async (time) => {
          try {
            const scheduledTime = new Date(time);
            const video = await PostScheduler.addVideo(accountId, title, description, scheduledTime);
            console.log(`✅ Video scheduled: ${video.id}`);
          } catch (error) {
            console.log(`❌ Error: ${error.message}`);
          }
          await showPrompt();
        });
      });
    });
  });
}

async function showStats(args) {
  const accountId = args[0];
  if (!accountId) {
    console.log('Usage: stats <account_id>');
    return;
  }

  const stats = await StatsWorker.getAccountStats(accountId);
  console.log(`\n📊 Stats for Account ${accountId}:`);
  console.log(`  Total Views: ${stats.total_views || 0}`);
  console.log(`  Total Likes: ${stats.total_likes || 0}`);
  console.log(`  Total Comments: ${stats.total_comments || 0}`);
  console.log(`  Total Shares: ${stats.total_shares || 0}`);
  console.log(`  Videos: ${stats.video_count || 0}`);
  console.log();
}

async function showLogs(args) {
  const limit = args[0] || 20;
  const logs = await logger.getLogs(limit);

  console.log(`\n📝 Recent Logs (last ${limit}):`);
  logs.forEach(log => {
    const prefix = log.status === 'error' ? '❌' : log.status === 'warning' ? '⚠️' : '✅';
    console.log(`  ${prefix} [${log.action}] ${log.message}`);
  });
  console.log();
}

module.exports = { start };
