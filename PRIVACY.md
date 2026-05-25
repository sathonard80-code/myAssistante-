# Privacy Policy

**Last Updated:** May 24, 2026

## 1. Overview
This Privacy Policy explains how the TikTok Bot ("App") collects, uses, and protects your data. We are committed to protecting your privacy and ensuring transparency about how your information is handled.

## 2. What Information We Collect

### Information You Provide:
- **TikTok Account Credentials** - Access tokens and refresh tokens (stored locally only)
- **Account Configuration** - Username, user ID, and account preferences
- **Video Information** - Titles, descriptions, and scheduling details

### Information Automatically Collected:
- **Video Statistics** - Views, likes, comments, shares (retrieved from TikTok API)
- **Comment Data** - Comments on your videos and responses
- **Bot Activity Logs** - Actions performed, timestamps, and status

## 3. How We Use Your Information

We use your data ONLY to:
- ✅ Schedule and post videos
- ✅ Auto-reply to comments
- ✅ Track video performance metrics
- ✅ Manage multiple accounts
- ✅ Generate audit logs for your safety

## 4. What We DON'T Do

- ❌ Share your data with third parties
- ❌ Sell your information
- ❌ Use your data for marketing purposes
- ❌ Store credentials on remote servers
- ❌ Track personal information beyond account management

## 5. Data Storage

All data is stored **locally on your machine** in:
- **Local SQLite Database** (`src/db/tiktok-bot.db`)
- **Environment Variables** (`.env` file)
- **Local Configuration Files** (`config/accounts.json`)

**Your data NEVER leaves your computer unless you explicitly share it.**

## 6. Security

We take security seriously:
- ✅ Credentials stored in environment variables (not in code)
- ✅ API tokens encrypted at rest
- ✅ No plaintext storage of sensitive data
- ✅ Rate limiting to prevent unauthorized access
- ✅ Audit logs for all actions

## 7. Third-Party Services

This App integrates with:
- **TikTok API** - Data shared per their privacy policy
- **Open TikTok APIs** - Standard API endpoints

We recommend reviewing TikTok's Privacy Policy: https://www.tiktok.com/privacy

## 8. Your Rights

You have the right to:
- ✅ Access your data (stored locally on your machine)
- ✅ Delete your data (remove local database)
- ✅ Revoke API access (via TikTok Developer Portal)
- ✅ Export your data

## 9. Data Retention

- **Active Data**: Stored while you use the App
- **Logs**: Stored locally for audit purposes
- **Deletion**: Delete the local database to remove all data

## 10. Changes to This Policy

We may update this policy. Continued use of the App means you accept changes.

## 11. Contact

For privacy concerns or questions, refer to:
- GitHub Issues: https://github.com/sathonard80-code/tiktokbot/issues
- README.md Documentation

## 12. Compliance

This App complies with:
- ✅ TikTok Terms of Service
- ✅ Data Protection Principles
- ✅ Open Source Standards

---

**Your privacy matters. This App is designed with privacy-first principles.**
