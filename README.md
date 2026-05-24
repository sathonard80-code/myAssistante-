# TikTok Bot - Complete Automation Suite

🤖 A Node.js bot to automate your TikTok account while respecting ToS and rate limits.

## Features

✅ **Multi-Account Support** - Manage multiple TikTok accounts  
✅ **Smart Scheduling** - Post up to 2 videos per day (configurable)  
✅ **Auto-Reply Comments** - Automatically respond to comments with rate-limiting  
✅ **Analytics Dashboard** - Track views, likes, comments, shares in real-time  
✅ **Rate Limiting** - Built-in safeguards to respect TikTok ToS  
✅ **REST API** - Full HTTP API for programmatic control  
✅ **CLI Dashboard** - Interactive command-line interface  

## Setup

### 1. Prerequisites
- Node.js 14+
- TikTok API credentials (request from TikTok Developer Portal)

### 2. Installation

```bash
git clone <your-repo>
cd bot-tiktok
npm install
```

### 3. Configuration

Copy `.env.example` to `.env` and fill in your TikTok API credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_ACCESS_TOKEN=your_access_token
PORT=3000
```

### 4. Add Accounts

Create `config/accounts.json` from the example:

```bash
cp config/accounts.json.example config/accounts.json
```

Edit with your TikTok account details.

## Usage

### Start the Bot

```bash
npm start
```

This starts:
- **HTTP Server** on `http://localhost:3000`
- **CLI Dashboard** for interactive control
- **Auto-workers** for comments, stats, scheduling

### CLI Commands

```
help              - Show available commands
accounts          - List all connected accounts
videos            - Show all scheduled/posted videos
add-video         - Schedule a new video
stats <id>        - Show account statistics
logs              - View recent action logs
exit              - Shutdown bot gracefully
```

### REST API Endpoints

#### Health Check
```bash
GET /health
```

#### Accounts
```bash
GET /accounts
POST /accounts
```

#### Videos
```bash
GET /videos
POST /videos
```

#### Statistics
```bash
GET /stats/:accountId
```

#### Comments
```bash
GET /comments/:accountId
```

#### Rate Limits
```bash
GET /rate-limits/:accountId
```

#### Logs
```bash
GET /logs
```

## Architecture

```
bot-tiktok/
├── src/
│   ├── api/              (TikTok API client)
│   ├── scheduler/        (Post scheduling)
│   ├── workers/          (Comments, stats)
│   ├── db/               (Database & schema)
│   ├── utils/            (Rate limiting, logging)
│   ├── cli/              (Dashboard CLI)
│   └── server.js         (Express API)
├── config/
│   └── accounts.json     (Account credentials)
├── .env                  (Environment variables)
└── index.js              (Entry point)
```

## Database Schema

- **accounts** - TikTok accounts management
- **videos** - Video tracking (scheduled, posted, stats)
- **comments** - Comments tracking & auto-responses
- **rate_limits** - Rate limit tracking per action
- **logs** - All bot activities

## Rate Limiting (ToS Compliant)

| Action | Default Limit |
|--------|---|
| Posts | 2 per day |
| Comments | 10 per hour |
| Stats Checks | 30 per hour |

All limits reset automatically and can be configured in `.env`.

## Important Notes

⚠️ **TikTok API Limitations:**
- Official API is restrictive (no direct likes/follows)
- This bot uses only what TikTok allows officially
- Respects all ToS requirements to avoid bans

🔒 **Security:**
- Never commit `.env` or `config/accounts.json`
- API tokens are sensitive - keep them private
- Use environment variables for production

## Error Handling

All errors are logged to:
- Console output
- SQLite logs table
- Log files in `logs/` directory

Check logs with:
```bash
# In CLI
logs

# Via API
curl http://localhost:3000/logs
```

## Troubleshooting

**Bot won't start:**
- Check `.env` file exists with valid TikTok credentials
- Ensure SQLite is installed (`npm install sqlite3`)

**Videos not posting:**
- Check daily post limit not exceeded
- Verify TikTok API credentials are valid
- See logs for specific error

**Comments not auto-replying:**
- Ensure CommentWorker is running
- Check rate limits aren't exceeded
- Verify API token has comment permissions

## Future Enhancements

- [ ] Web dashboard UI
- [ ] Database persistence improvements
- [ ] Advanced engagement strategies
- [ ] Analytics export (CSV, PDF)
- [ ] Webhook support for TikTok events
- [ ] Docker support

## License

MIT

## Support

For issues and questions, check the logs first:
```bash
npm start
# Then use: logs [limit]
```

---

**⚡ Built with Node.js, Express, SQLite, and TikTok API**
